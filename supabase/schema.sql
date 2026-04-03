-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ORGANISATIONS
create table organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  abn text,
  logo_url text,
  created_at timestamptz default now()
);

-- USERS (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references organisations(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('owner', 'office', 'supervisor', 'client')),
  created_at timestamptz default now()
);

-- CONTACTS (clients, subcontractors, suppliers)
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organisations(id) on delete cascade,
  type text not null check (type in ('client', 'subcontractor', 'supplier', 'other')),
  name text not null,
  company text,
  email text,
  phone text,
  abn text,
  address text,
  created_at timestamptz default now()
);

-- PROJECTS
create table projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organisations(id) on delete cascade,
  client_contact_id uuid references contacts(id),
  name text not null,
  address text not null,
  status text not null default 'tender' check (status in ('tender', 'active', 'practical_completion', 'defects', 'complete', 'on_hold')),
  contract_value decimal(12,2),
  start_date date,
  end_date date,
  description text,
  created_at timestamptz default now()
);

-- PROJECT TEAM (links users to projects)
create table project_users (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null check (role in ('owner', 'office', 'supervisor', 'client')),
  unique(project_id, user_id)
);

-- COST CATEGORIES (per project)
create table cost_categories (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  sort_order int default 0
);

-- COST ITEMS (budget line items)
create table cost_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  category_id uuid references cost_categories(id),
  description text not null,
  budgeted decimal(12,2) not null default 0,
  actual decimal(12,2) not null default 0,
  committed decimal(12,2) not null default 0,
  notes text,
  created_at timestamptz default now()
);

-- SUBCONTRACTS
create table subcontracts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  contact_id uuid references contacts(id),
  trade text not null,
  description text,
  value decimal(12,2),
  status text not null default 'draft' check (status in ('draft', 'sent', 'executed', 'complete', 'disputed')),
  executed_date date,
  notes text,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table organisations enable row level security;
alter table users enable row level security;
alter table contacts enable row level security;
alter table projects enable row level security;
alter table project_users enable row level security;
alter table cost_categories enable row level security;
alter table cost_items enable row level security;
alter table subcontracts enable row level security;

-- Helper function: get current user's org
create or replace function get_my_org_id()
returns uuid language sql security definer stable as $$
  select org_id from users where id = auth.uid()
$$;

-- Helper function: get current user's role
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from users where id = auth.uid()
$$;

-- Helper function: check if user is on a project
create or replace function is_on_project(proj_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from project_users
    where project_id = proj_id and user_id = auth.uid()
  )
$$;

-- POLICIES
create policy "users see own org" on organisations
  for select using (id = get_my_org_id());

create policy "users see org members" on users
  for select using (org_id = get_my_org_id());

create policy "owner manages users" on users
  for all using (org_id = get_my_org_id() and get_my_role() = 'owner');

create policy "contacts org access" on contacts
  for all using (org_id = get_my_org_id());

create policy "projects access" on projects
  for select using (
    org_id = get_my_org_id() and (
      get_my_role() in ('owner', 'office')
      or is_on_project(id)
    )
  );

create policy "owner office manage projects" on projects
  for all using (org_id = get_my_org_id() and get_my_role() in ('owner', 'office'));

create policy "project_users access" on project_users
  for select using (
    exists (select 1 from projects where id = project_id and org_id = get_my_org_id())
  );

create policy "cost_items access" on cost_items
  for all using (
    exists (
      select 1 from projects where id = project_id
      and org_id = get_my_org_id()
      and get_my_role() in ('owner', 'office')
    )
  );

create policy "cost_categories access" on cost_categories
  for all using (
    exists (
      select 1 from projects where id = project_id
      and org_id = get_my_org_id()
      and get_my_role() in ('owner', 'office')
    )
  );

create policy "subcontracts access" on subcontracts
  for all using (
    exists (
      select 1 from projects where id = project_id
      and org_id = get_my_org_id()
      and get_my_role() in ('owner', 'office')
    )
  );

-- SEED DATA
insert into organisations (id, name, abn) values
  ('00000000-0000-0000-0000-000000000001', 'Grimmond Construction', '12 345 678 901');

-- Note: Create your user via Supabase Auth first, then run:
-- insert into users (id, org_id, name, email, role) values
--   ('[your-auth-user-id]', '00000000-0000-0000-0000-000000000001', 'Nathan Grimmond', 'nathan@grimmondconstruction.com.au', 'owner');

insert into contacts (org_id, type, name, company, email, phone) values
  ('00000000-0000-0000-0000-000000000001', 'client', 'Brett Frizelle', null, 'brett@example.com', '0400 000 001'),
  ('00000000-0000-0000-0000-000000000001', 'subcontractor', 'Gold Coast Electrical', 'GC Electrical Pty Ltd', 'info@gcelectrical.com.au', '0400 000 002'),
  ('00000000-0000-0000-0000-000000000001', 'subcontractor', 'Prestige Plumbing', 'Prestige Plumbing Co', 'info@prestigeplumbing.com.au', '0400 000 003');

insert into projects (org_id, name, address, status, contract_value, start_date, end_date) values
  ('00000000-0000-0000-0000-000000000001', 'Ocean Isles Renovation', '25 Heron Ave, Broadbeach', 'active', 1850000, '2025-01-15', '2025-09-30'),
  ('00000000-0000-0000-0000-000000000001', 'Burleigh Residences', '27 Beaconsfield Tce, Burleigh Heads', 'tender', 3200000, '2025-06-01', '2026-06-01');
