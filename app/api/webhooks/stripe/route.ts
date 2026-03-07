import { NextResponse, type NextRequest } from "next/server";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSubscriptionEmail, sendPaymentFailedEmail } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    // ── Checkout completed — activate subscription ──────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.subscription
        ? (await getSubscriptionUserId(session.subscription as string))
        : session.metadata?.supabase_user_id;

      if (!userId) break;

      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);

      if (plan) {
        await admin
          .from("user_profiles")
          .update({
            plan,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            subscription_status: subscription.status,
            current_period_end: new Date(
              subscription.items.data[0].current_period_end * 1000
            ).toISOString(),
          })
          .eq("id", userId);

        // Send subscription confirmation email
        const { data: userProfile } = await admin
          .from("user_profiles")
          .select("email")
          .eq("id", userId)
          .single();
        if (userProfile?.email) {
          await sendSubscriptionEmail(userProfile.email, plan).catch(() => {});
        }
      }
      break;
    }

    // ── Subscription updated (upgrade, downgrade, renewal) ──────
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id ||
        (await getUserIdFromCustomer(subscription.customer as string));

      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);

      await admin
        .from("user_profiles")
        .update({
          ...(plan ? { plan } : {}),
          stripe_price_id: priceId,
          subscription_status: subscription.status,
          current_period_end: new Date(
            subscription.items.data[0].current_period_end * 1000
          ).toISOString(),
        })
        .eq("id", userId);
      break;
    }

    // ── Subscription deleted (canceled at period end or immediate) ─
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id ||
        (await getUserIdFromCustomer(subscription.customer as string));

      if (!userId) break;

      await admin
        .from("user_profiles")
        .update({
          plan: "free",
          subscription_status: "canceled",
          stripe_subscription_id: null,
          stripe_price_id: null,
          current_period_end: null,
        })
        .eq("id", userId);
      break;
    }

    // ── Invoice payment failed ──────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = await getUserIdFromCustomer(invoice.customer as string);

      if (!userId) break;

      await admin
        .from("user_profiles")
        .update({ subscription_status: "past_due" })
        .eq("id", userId);

      // Send payment failed email
      const { data: failedUser } = await admin
        .from("user_profiles")
        .select("email")
        .eq("id", userId)
        .single();
      if (failedUser?.email) {
        await sendPaymentFailedEmail(failedUser.email).catch(() => {});
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ─────────────────────────────────────────────────────

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id || null;
}

async function getSubscriptionUserId(subscriptionId: string): Promise<string | null> {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  return subscription.metadata?.supabase_user_id ||
    (await getUserIdFromCustomer(subscription.customer as string));
}
