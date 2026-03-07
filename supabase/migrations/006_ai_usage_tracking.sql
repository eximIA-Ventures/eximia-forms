-- ======================================================================
-- eximIA Forms — AI usage tracking per user per month
-- ======================================================================

create table ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null, -- e.g. '2026-03'
  generation_count integer not null default 0,
  primary key (user_id, month)
);

alter table ai_usage enable row level security;

-- Super admin can see all, users can see own
create policy "Users can view own AI usage"
  on ai_usage for select
  using (auth.uid() = user_id or is_super_admin());

-- Only service role inserts/updates (via API)
create policy "Service role manages AI usage"
  on ai_usage for all
  using (is_super_admin());

create index idx_ai_usage_month on ai_usage(month);
