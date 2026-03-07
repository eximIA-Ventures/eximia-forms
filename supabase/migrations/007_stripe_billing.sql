-- ======================================================================
-- eximIA Forms — Stripe billing columns on user_profiles
-- ======================================================================

alter table user_profiles
  add column stripe_customer_id text unique,
  add column stripe_subscription_id text unique,
  add column stripe_price_id text,
  add column subscription_status text default 'inactive'
    check (subscription_status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'inactive')),
  add column current_period_end timestamptz;

create index idx_user_profiles_stripe_customer on user_profiles(stripe_customer_id);
create index idx_user_profiles_subscription_status on user_profiles(subscription_status);
