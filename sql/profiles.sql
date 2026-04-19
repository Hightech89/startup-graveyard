-- Minimal profiles table for nickname support.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to authenticated;
grant select, insert, update on table public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Narrow auth lookup for public display fallbacks (nickname -> email).
-- Returns only id/email for explicit user IDs provided by the caller.
create or replace function public.get_user_emails(user_ids uuid[])
returns table(id uuid, email text)
language sql
security definer
set search_path = public, auth
as $$
  select u.id, u.email::text
  from auth.users u
  where u.id = any(user_ids)
    and u.email is not null
$$;

revoke all on function public.get_user_emails(uuid[]) from public;
grant execute on function public.get_user_emails(uuid[]) to anon;
grant execute on function public.get_user_emails(uuid[]) to authenticated;

