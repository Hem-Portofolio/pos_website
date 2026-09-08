-- Warung POS — Supabase migration (jalankan di SQL Editor)
-- Membuat 7 tabel + RLS + policy per role
-- Prasyarat: extension pgcrypto untuk gen_random_uuid()

create extension if not exists "pgcrypto";

-- users: mirror dari auth.users (id = auth.uid())
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin','kasir','waiter','dapur')),
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  is_available boolean default true
);

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  number integer unique not null,
  status text not null default 'available' check (status in ('available','occupied','reserved'))
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references public.tables(id) on delete set null,
  waiter_id uuid references public.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','cooking','ready','paid','cancelled')),
  total integer not null default 0,
  customer_name text,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  qty integer not null check (qty > 0),
  note text,
  subtotal integer not null
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null unique,
  method text not null check (method in ('cash','qris','debit')),
  amount integer not null,
  paid_at timestamptz default now()
);

-- Helper: cek role pemanggil
create or replace function public.current_role()
returns text language sql stable as $$
  select role from public.users where id = auth.uid() limit 1
$$;

-- Aktifkan RLS
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- Kebijakan: admin bisa semua
-- Untuk ringkas, buat policy per tabel menggabungkan read untuk semua role login, write terbatas

-- users: setiap user bisa baca semua, hanya admin bisa insert/update/delete (service_role bypass RLS)
drop policy if exists "users_select_all" on public.users;
create policy "users_select_all" on public.users for select to authenticated using (true);
drop policy if exists "users_admin_write" on public.users;
create policy "users_admin_write" on public.users for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');

-- categories: read semua, write admin
drop policy if exists "cat_read" on public.categories;
create policy "cat_read" on public.categories for select to authenticated using (true);
drop policy if exists "cat_write_admin" on public.categories;
create policy "cat_write_admin" on public.categories for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');

-- menu_items: read semua, write admin
drop policy if exists "menu_read" on public.menu_items;
create policy "menu_read" on public.menu_items for select to authenticated using (true);
drop policy if exists "menu_write_admin" on public.menu_items;
create policy "menu_write_admin" on public.menu_items for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');

-- tables: read semua, write admin
drop policy if exists "tables_read" on public.tables;
create policy "tables_read" on public.tables for select to authenticated using (true);
drop policy if exists "tables_write_admin" on public.tables;
create policy "tables_write_admin" on public.tables for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');

-- orders: read semua login, insert waiter/kasir/admin, update dapur/kasir/admin
drop policy if exists "orders_read" on public.orders;
create policy "orders_read" on public.orders for select to authenticated using (true);
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert to authenticated with check (public.current_role() in ('admin','kasir','waiter'));
drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders for update to authenticated using (public.current_role() in ('admin','kasir','dapur','waiter')) with check (public.current_role() in ('admin','kasir','dapur','waiter'));

-- order_items: ikut orders
drop policy if exists "oi_read" on public.order_items;
create policy "oi_read" on public.order_items for select to authenticated using (true);
drop policy if exists "oi_write" on public.order_items;
create policy "oi_write" on public.order_items for all to authenticated using (public.current_role() in ('admin','kasir','waiter')) with check (public.current_role() in ('admin','kasir','waiter'));

-- payments: read admin/kasir, insert kasir/admin
drop policy if exists "pay_read" on public.payments;
create policy "pay_read" on public.payments for select to authenticated using (public.current_role() in ('admin','kasir'));
drop policy if exists "pay_insert" on public.payments;
create policy "pay_insert" on public.payments for insert to authenticated with check (public.current_role() in ('admin','kasir'));

-- Seed kategori & meja (opsional)
insert into public.categories (name) values ('Nasi & Utama'),('Mie & Sop'),('Ayam & Ikan'),('Minuman'),('Penutup') on conflict do nothing;
insert into public.tables (number, status) values (1,'available'),(2,'occupied'),(3,'occupied'),(4,'available'),(5,'reserved'),(6,'available'),(7,'occupied'),(8,'available'),(9,'available'),(10,'occupied'),(11,'available'),(12,'reserved') on conflict do nothing;
