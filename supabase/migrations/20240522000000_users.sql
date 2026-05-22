create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  username text,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_telegram_id_key unique (telegram_id)
);

create index if not exists users_telegram_id_idx on public.users (telegram_id);

alter table public.users enable row level security;

-- Bootstrap via anon key. Tighten with initData verification (Edge Function) later.
create policy "users_select_anon"
  on public.users
  for select
  to anon
  using (true);

create policy "users_insert_anon"
  on public.users
  for insert
  to anon
  with check (true);

create policy "users_update_anon"
  on public.users
  for update
  to anon
  using (true)
  with check (true);
