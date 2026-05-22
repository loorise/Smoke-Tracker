-- Harden RLS: remove public anon access, scope all rows to JWT telegram_id claim.

-- 1. Drop unsafe open anon policies
drop policy if exists "users_select_anon" on public.users;
drop policy if exists "users_insert_anon" on public.users;
drop policy if exists "users_update_anon" on public.users;

drop policy if exists "smoking_events_select_anon" on public.smoking_events;
drop policy if exists "smoking_events_insert_anon" on public.smoking_events;
drop policy if exists "smoking_events_delete_anon" on public.smoking_events;

-- 2. JWT helper (telegram_id claim set by verify-telegram Edge Function)
create or replace function public.current_telegram_id()
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select nullif(auth.jwt() ->> 'telegram_id', '')::bigint;
$$;

revoke all on function public.current_telegram_id() from public;
grant execute on function public.current_telegram_id() to authenticated;

-- 3. Revoke direct anon table access
revoke all on table public.users from anon;
revoke all on table public.smoking_events from anon;

-- 4. Grant authenticated role (Mini App session after Telegram verify)
grant select, insert, update on table public.users to authenticated;
grant select, insert, delete on table public.smoking_events to authenticated;

-- 5. users: own row only (settings/profile columns included)
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (telegram_id = public.current_telegram_id());

create policy "users_insert_own"
  on public.users
  for insert
  to authenticated
  with check (telegram_id = public.current_telegram_id());

create policy "users_update_own"
  on public.users
  for update
  to authenticated
  using (telegram_id = public.current_telegram_id())
  with check (telegram_id = public.current_telegram_id());

-- 6. smoking_events: own rows only
create policy "smoking_events_select_own"
  on public.smoking_events
  for select
  to authenticated
  using (telegram_id = public.current_telegram_id());

create policy "smoking_events_insert_own"
  on public.smoking_events
  for insert
  to authenticated
  with check (telegram_id = public.current_telegram_id());

create policy "smoking_events_delete_own"
  on public.smoking_events
  for delete
  to authenticated
  using (telegram_id = public.current_telegram_id());
