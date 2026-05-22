alter table public.users
  add column if not exists daily_target integer,
  add column if not exists pack_price numeric(10, 2),
  add column if not exists cigs_per_pack integer;
