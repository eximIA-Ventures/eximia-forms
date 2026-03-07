import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, getPriceIdFromPlan } from "@/lib/stripe";
import type { UserPlan } from "@/lib/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await request.json()) as { plan: string };

  if (!["pro", "business", "enterprise"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceIdFromPlan(plan as "pro" | "business" | "enterprise");
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  // Create Stripe customer if not exists
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: profile?.email || user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await admin
      .from("user_profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/admin/upgrade?success=true&plan=${plan}`,
    cancel_url: `${appUrl}/admin/upgrade?canceled=true`,
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
