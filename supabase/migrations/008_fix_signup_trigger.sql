-- ======================================================================
-- eximIA Forms — Fix signup trigger + add INSERT policy
-- ======================================================================

-- Add INSERT policy for user_profiles (missing from 004)
-- The trigger runs as SECURITY DEFINER but some Supabase configs
-- still enforce RLS. This policy ensures the service role can insert.
create policy "profiles_insert_via_trigger" on user_profiles
  for insert with check (true);

-- Recreate the trigger function to be more robust:
-- 1. Explicitly set all NOT NULL columns with defaults
-- 2. ON CONFLICT DO NOTHING to handle retries/re-signups
-- 3. Better error handling
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, email, full_name, role, is_active, plan)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user',
    true,
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
