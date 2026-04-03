-- Fix tenders RLS: split into separate policies so INSERT works
-- when project_id is null or project hasn't been linked yet.
-- Run this in the Supabase SQL Editor.

drop policy if exists "tenders access" on tenders;

create policy "tenders select" on tenders
  for select using (
    get_my_role() in ('owner', 'office')
    and (
      project_id is null
      or exists (select 1 from projects where id = project_id and org_id = get_my_org_id())
    )
  );

create policy "tenders insert" on tenders
  for insert with check (
    get_my_role() in ('owner', 'office')
  );

create policy "tenders update" on tenders
  for update using (
    get_my_role() in ('owner', 'office')
    and (
      project_id is null
      or exists (select 1 from projects where id = project_id and org_id = get_my_org_id())
    )
  );

create policy "tenders delete" on tenders
  for delete using (
    get_my_role() in ('owner', 'office')
    and (
      project_id is null
      or exists (select 1 from projects where id = project_id and org_id = get_my_org_id())
    )
  );
