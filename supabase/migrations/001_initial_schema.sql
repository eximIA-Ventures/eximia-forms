-- ======================================================================
-- eximIA Forms — Initial Schema
-- ======================================================================

-- gen_random_uuid() is built-in since PG 13

-- ======================================================================
-- WORKSPACES
-- ======================================================================

create table form_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_workspaces_owner on form_workspaces(owner_id);
create unique index idx_workspaces_slug on form_workspaces(slug);

-- ======================================================================
-- FORMS
-- ======================================================================

create table forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references form_workspaces(id) on delete cascade,
  title text not null default 'Formulário sem título',
  slug text not null,
  description text,
  schema jsonb not null default '{"version":1,"title":"Formulário sem título","description":"","settings":{"allowMultipleSubmissions":true,"showProgressBar":true,"shufflePages":false,"requireAuth":false},"pages":[{"id":"default","title":"Página 1","elements":[],"conditions":[]}]}',
  status text not null default 'draft' check (status in ('draft', 'published', 'closed', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_forms_workspace on forms(workspace_id);
create unique index idx_forms_workspace_slug on forms(workspace_id, slug);
create index idx_forms_status on forms(status);

-- ======================================================================
-- SUBMISSIONS
-- ======================================================================

create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  data jsonb not null default '{}',
  metadata jsonb not null default '{}',
  is_complete boolean not null default false,
  page_history text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_submissions_form on form_submissions(form_id);
create index idx_submissions_form_complete on form_submissions(form_id, is_complete);
create index idx_submissions_created on form_submissions(created_at desc);

-- ======================================================================
-- ANALYTICS (aggregated per day)
-- ======================================================================

create table form_analytics (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  date date not null default current_date,
  views integer not null default 0,
  starts integer not null default 0,
  completions integer not null default 0,
  drop_off_page jsonb not null default '{}',
  unique(form_id, date)
);

create index idx_analytics_form_date on form_analytics(form_id, date desc);

-- ======================================================================
-- AI ANALYSES (cached)
-- ======================================================================

create table form_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  type text not null check (type in ('full', 'summary', 'themes', 'sentiment', 'insights')),
  result jsonb not null default '{}',
  submission_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_ai_analyses_form_type on form_ai_analyses(form_id, type);

-- ======================================================================
-- UPDATED_AT TRIGGER
-- ======================================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_workspaces_updated before update on form_workspaces
  for each row execute function update_updated_at();

create trigger trg_forms_updated before update on forms
  for each row execute function update_updated_at();

-- ======================================================================
-- ROW LEVEL SECURITY
-- ======================================================================

alter table form_workspaces enable row level security;
alter table forms enable row level security;
alter table form_submissions enable row level security;
alter table form_analytics enable row level security;
alter table form_ai_analyses enable row level security;

-- Workspace owner = full access
create policy "workspace_owner_all" on form_workspaces
  for all using (owner_id = auth.uid());

-- Forms: owner access via workspace
create policy "forms_owner_all" on forms
  for all using (
    workspace_id in (
      select id from form_workspaces where owner_id = auth.uid()
    )
  );

-- Forms: public can read schema of published forms
create policy "forms_public_read" on forms
  for select using (status = 'published');

-- Submissions: public can insert on published forms
create policy "submissions_public_insert" on form_submissions
  for insert with check (
    form_id in (select id from forms where status = 'published')
  );

-- Submissions: owner can read via workspace
create policy "submissions_owner_read" on form_submissions
  for select using (
    form_id in (
      select f.id from forms f
      join form_workspaces w on f.workspace_id = w.id
      where w.owner_id = auth.uid()
    )
  );

-- Analytics: owner access via workspace
create policy "analytics_owner_all" on form_analytics
  for all using (
    form_id in (
      select f.id from forms f
      join form_workspaces w on f.workspace_id = w.id
      where w.owner_id = auth.uid()
    )
  );

-- AI analyses: owner access via workspace
create policy "ai_analyses_owner_all" on form_ai_analyses
  for all using (
    form_id in (
      select f.id from forms f
      join form_workspaces w on f.workspace_id = w.id
      where w.owner_id = auth.uid()
    )
  );
