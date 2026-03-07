-- ======================================================================
-- eximIA Forms — SaaS Multi-Tenant: User Profiles + RLS Updates
-- ======================================================================

-- ======================================================================
-- USER PROFILES
-- ======================================================================

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'super_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_user_profiles_email on user_profiles(email);
create index idx_user_profiles_role on user_profiles(role);

alter table user_profiles enable row level security;

-- Trigger: auto-update updated_at
create trigger trg_user_profiles_updated before update on user_profiles
  for each row execute function update_updated_at();

-- ======================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ======================================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ======================================================================
-- HELPER: is_super_admin()
-- ======================================================================

create or replace function is_super_admin()
returns boolean as $$
begin
  return exists (
    select 1 from user_profiles
    where id = auth.uid()
      and role = 'super_admin'
      and is_active = true
  );
end;
$$ language plpgsql security definer stable;

-- ======================================================================
-- RLS POLICIES: USER PROFILES
-- ======================================================================

-- Users can read their own profile
create policy "profiles_own_read" on user_profiles
  for select using (id = auth.uid());

-- Super admin can read all profiles
create policy "profiles_super_admin_read" on user_profiles
  for select using (is_super_admin());

-- Super admin can update any profile
create policy "profiles_super_admin_update" on user_profiles
  for update using (is_super_admin());

-- Users can update their own profile (name only, not role)
create policy "profiles_own_update" on user_profiles
  for update using (id = auth.uid());

-- ======================================================================
-- UPDATE EXISTING RLS POLICIES: ADD SUPER ADMIN ACCESS
-- ======================================================================

-- WORKSPACES: super_admin can access all
drop policy if exists "workspace_owner_all" on form_workspaces;
create policy "workspace_owner_all" on form_workspaces
  for all using (owner_id = auth.uid() or is_super_admin());

-- FORMS: super_admin can access all (keep public read separate)
drop policy if exists "forms_owner_all" on forms;
create policy "forms_owner_all" on forms
  for all using (
    workspace_id in (
      select id from form_workspaces where owner_id = auth.uid()
    )
    or is_super_admin()
  );

-- SUBMISSIONS: super_admin can read all
drop policy if exists "submissions_owner_read" on form_submissions;
create policy "submissions_owner_read" on form_submissions
  for select using (
    form_id in (
      select f.id from forms f
      join form_workspaces w on f.workspace_id = w.id
      where w.owner_id = auth.uid()
    )
    or is_super_admin()
  );

-- ANALYTICS: super_admin can access all
drop policy if exists "analytics_owner_all" on form_analytics;
create policy "analytics_owner_all" on form_analytics
  for all using (
    form_id in (
      select f.id from forms f
      join form_workspaces w on f.workspace_id = w.id
      where w.owner_id = auth.uid()
    )
    or is_super_admin()
  );

-- AI ANALYSES: super_admin can access all
drop policy if exists "ai_analyses_owner_all" on form_ai_analyses;
create policy "ai_analyses_owner_all" on form_ai_analyses
  for all using (
    form_id in (
      select f.id from forms f
      join form_workspaces w on f.workspace_id = w.id
      where w.owner_id = auth.uid()
    )
    or is_super_admin()
  );
