import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Convenience alias
export const stripe = {
  get instance() {
    return getStripe();
  },
};

/** Map Stripe Price IDs to our plan names */
export function getPlanFromPriceId(priceId: string): "pro" | "business" | "enterprise" | null {
  const proPriceId = process.env.STRIPE_PRICE_ID_PRO;
  const businessPriceId = process.env.STRIPE_PRICE_ID_BUSINESS;
  const enterprisePriceId = process.env.STRIPE_PRICE_ID_ENTERPRISE;

  if (proPriceId && priceId === proPriceId) return "pro";
  if (businessPriceId && priceId === businessPriceId) return "business";
  if (enterprisePriceId && priceId === enterprisePriceId) return "enterprise";
  return null;
}

/** Map our plan names to Stripe Price IDs */
export function getPriceIdFromPlan(plan: "pro" | "business" | "enterprise"): string {
  const map: Record<string, string | undefined> = {
    pro: process.env.STRIPE_PRICE_ID_PRO,
    business: process.env.STRIPE_PRICE_ID_BUSINESS,
    enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
  };
  return map[plan] || "";
}
