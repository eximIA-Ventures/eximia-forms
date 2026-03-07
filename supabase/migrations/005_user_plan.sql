-- ======================================================================
-- eximIA Forms — Add plan field to user_profiles
-- ======================================================================

alter table user_profiles
  add column plan text not null default 'free'
  check (plan in ('free', 'pro', 'business', 'enterprise'));

create index idx_user_profiles_plan on user_profiles(plan);
