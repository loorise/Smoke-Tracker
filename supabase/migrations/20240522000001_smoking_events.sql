create table if not exists public.smoking_events (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  smoked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists smoking_events_telegram_id_smoked_at_idx
  on public.smoking_events (telegram_id, smoked_at desc);

alter table public.smoking_events enable row level security;

create policy "smoking_events_select_anon"
  on public.smoking_events
  for select
  to anon
  using (true);

create policy "smoking_events_insert_anon"
  on public.smoking_events
  for insert
  to anon
  with check (true);
