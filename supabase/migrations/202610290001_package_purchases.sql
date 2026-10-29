-- AIRA CBT: authoritative package catalogue and paid subscriptions.
create extension if not exists pgcrypto;

create table if not exists public.package_catalog (
  id text primary key,
  title text not null,
  price integer not null check (price >= 0),
  duration_days integer not null check (duration_days > 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.package_catalog (id,title,price,duration_days) values
 ('pkg-sd','Paket TKA SD',49000,60),
 ('pkg-smp','Paket Prestasi TKA SMP: Taklukkan SMA Unggulan',69000,60),
 ('pkg-sma','Paket Master TKA SMA: Kunci Lolos PTN Favorit & Kedinasan',89000,60),
 ('pkg-bundle-smp-sma','Bundle Kombo Remaja: Sukses SMP & Lolos UTBK SMA',109000,60),
 ('pkg-all','Paket Ultimate All-Access Bundle (SD + SMP + SMA)',129000,60)
on conflict (id) do nothing;

create table if not exists public.package_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null references public.package_catalog(id),
  order_id text not null unique,
  amount integer not null check (amount > 0),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','settlement','capture','expired','cancel','deny','refund','failure')),
  purchased_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists package_purchases_user_expiry_idx
 on public.package_purchases(user_id, expires_at desc);
alter table public.package_catalog enable row level security;
alter table public.package_purchases enable row level security;
drop policy if exists "active packages are readable" on public.package_catalog;
create policy "active packages are readable" on public.package_catalog
 for select to authenticated using (is_active = true);
drop policy if exists "students read own purchases" on public.package_purchases;
create policy "students read own purchases" on public.package_purchases
 for select to authenticated using (auth.uid() = user_id);
-- No client-side INSERT/UPDATE policy: checkout and payment status are server-controlled.
