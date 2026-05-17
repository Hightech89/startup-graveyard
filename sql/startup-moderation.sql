-- Basic pre-moderation for Startup Graveyard submissions.
-- Existing rows are approved; future user submissions default to pending.

alter table public.startups
  add column if not exists status text;

update public.startups
set status = 'approved'
where status is null
  or status not in ('pending', 'approved', 'rejected');

alter table public.startups
  alter column status set default 'pending',
  alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'startups_status_check'
      and conrelid = 'public.startups'::regclass
  ) then
    alter table public.startups
      add constraint startups_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end
$$;

create index if not exists startups_status_created_at_idx
  on public.startups (status, created_at desc);

drop policy if exists "Public can read startups" on public.startups;
drop policy if exists "Public can read approved startups" on public.startups;
create policy "Public can read approved startups"
  on public.startups
  for select
  to public
  using (status = 'approved');

drop policy if exists "Users can read their own startups" on public.startups;
create policy "Users can read their own startups"
  on public.startups
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Public can update upvotes" on public.startups;

create or replace function public.protect_startup_status()
returns trigger
language plpgsql
as $$
begin
  if auth.role() in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.status = 'pending';
    elsif tg_op = 'UPDATE' then
      new.status = old.status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists startups_protect_status on public.startups;
create trigger startups_protect_status
before insert or update on public.startups
for each row
execute function public.protect_startup_status();

drop trigger if exists startups_force_pending_status on public.startups;
drop function if exists public.force_pending_startup_status();
