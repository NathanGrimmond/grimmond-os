-- PHASE 2 SCHEMA ADDITIONS
-- Run this in the Supabase SQL Editor after Phase 1 schema

-- PURCHASE ORDERS
create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  subcontract_id uuid references subcontracts(id) on delete set null,
  po_number text not null,
  description text not null,
  amount decimal(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'issued', 'acknowledged', 'complete', 'disputed')),
  issued_date date,
  due_date date,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table claim_milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  percentage decimal(5,2) not null default 0,
  sort_order int default 0,
  completed boolean default false,
  completed_date date
);

create table progress_claims (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  claim_number int not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'certified', 'paid', 'disputed')),
  amount_claimed decimal(12,2) not null default 0,
  amount_certified decimal(12,2),
  amount_paid decimal(12,2),
  submitted_date date,
  certified_date date,
  paid_date date,
  notes text,
  created_at timestamptz default now()
);

create table claim_line_items (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid references progress_claims(id) on delete cascade,
  cost_item_id uuid references cost_items(id) on delete set null,
  milestone_id uuid references claim_milestones(id) on delete set null,
  description text not null,
  scheduled_value decimal(12,2) not null default 0,
  percent_complete decimal(5,2) not null default 0,
  amount_this_claim decimal(12,2) not null default 0,
  amount_previously_claimed decimal(12,2) not null default 0
);

create table documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  type text not null check (type in ('drawing', 'specification', 'rfi', 'contract', 'report', 'photo', 'other')),
  discipline text,
  revision text default 'A',
  revision_notes text,
  storage_path text not null,
  file_size int,
  file_type text,
  status text not null default 'current' check (status in ('current', 'superseded', 'void')),
  shared_with_client boolean default false,
  shared_with_subbies boolean default false,
  uploaded_by uuid references users(id),
  uploaded_at timestamptz default now()
);

create table rfis (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  rfi_number int not null,
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid references users(id),
  raised_by uuid references users(id),
  due_date date,
  answered_date date,
  answer text,
  created_at timestamptz default now()
);

create table variations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  subcontract_id uuid references subcontracts(id) on delete set null,
  variation_number int not null,
  type text not null check (type in ('client', 'subcontractor', 'internal')),
  description text not null,
  reason text,
  amount decimal(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'on_hold')),
  initiated_by uuid references users(id),
  approved_by uuid references users(id),
  approved_date date,
  notes text,
  created_at timestamptz default now()
);

create table tenders (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed', 'awarded')),
  issue_date date,
  close_date date,
  awarded_to uuid references contacts(id),
  awarded_date date,
  notes text,
  created_at timestamptz default now()
);

create table tender_documents (
  id uuid primary key default uuid_generate_v4(),
  tender_id uuid references tenders(id) on delete cascade,
  name text not null,
  storage_path text not null,
  version int default 1,
  created_at timestamptz default now()
);

create table tender_invitees (
  id uuid primary key default uuid_generate_v4(),
  tender_id uuid references tenders(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  email text not null,
  notified_at timestamptz,
  viewed_at timestamptz,
  unique(tender_id, contact_id)
);

create table tender_changes (
  id uuid primary key default uuid_generate_v4(),
  tender_id uuid references tenders(id) on delete cascade,
  change_description text not null,
  changed_by uuid references users(id),
  notifications_sent boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table purchase_orders enable row level security;
alter table claim_milestones enable row level security;
alter table progress_claims enable row level security;
alter table claim_line_items enable row level security;
alter table documents enable row level security;
alter table rfis enable row level security;
alter table variations enable row level security;
alter table tenders enable row level security;
alter table tender_documents enable row level security;
alter table tender_invitees enable row level security;
alter table tender_changes enable row level security;

create policy "po access" on purchase_orders for all using (
  exists (select 1 from projects where id = project_id and org_id = get_my_org_id() and get_my_role() in ('owner','office'))
);
create policy "milestones access" on claim_milestones for all using (
  exists (select 1 from projects where id = project_id and org_id = get_my_org_id() and get_my_role() in ('owner','office'))
);
create policy "claims access" on progress_claims for all using (
  exists (select 1 from projects where id = project_id and org_id = get_my_org_id() and get_my_role() in ('owner','office'))
);
create policy "claim items access" on claim_line_items for all using (
  exists (select 1 from progress_claims pc join projects p on p.id = pc.project_id where pc.id = claim_id and p.org_id = get_my_org_id() and get_my_role() in ('owner','office'))
);
create policy "documents access" on documents for all using (
  exists (select 1 from projects where id = project_id and org_id = get_my_org_id())
);
create policy "rfis access" on rfis for all using (
  exists (select 1 from projects where id = project_id and org_id = get_my_org_id())
);
create policy "variations access" on variations for all using (
  exists (select 1 from projects where id = project_id and org_id = get_my_org_id() and get_my_role() in ('owner','office'))
);
create policy "tenders access" on tenders for all using (
  exists (select 1 from projects where id = project_id and org_id = get_my_org_id() and get_my_role() in ('owner','office'))
);
create policy "tender docs access" on tender_documents for all using (
  exists (select 1 from tenders t join projects p on p.id = t.project_id where t.id = tender_id and p.org_id = get_my_org_id())
);
create policy "tender invitees access" on tender_invitees for all using (
  exists (select 1 from tenders t join projects p on p.id = t.project_id where t.id = tender_id and p.org_id = get_my_org_id())
);
create policy "tender changes access" on tender_changes for all using (
  exists (select 1 from tenders t join projects p on p.id = t.project_id where t.id = tender_id and p.org_id = get_my_org_id())
);
