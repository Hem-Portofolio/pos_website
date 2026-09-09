-- 002_simplify_roles — sederhanakan 4 role -> 2 role (admin, user)
-- Jalankan di Supabase SQL Editor SETELAH 001

-- 1. Lepas constraint lama & ganti ke admin|user
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('admin','user'));

-- 2. Migrasi data lama: kasir|waiter|dapur -> user
update public.users set role='user' where role in ('kasir','waiter','dapur');

-- 3. Update policies yang masih menyebut role lama
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert to authenticated with check (public.current_role() in ('admin','user'));
drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders for update to authenticated using (public.current_role() in ('admin','user')) with check (public.current_role() in ('admin','user'));

drop policy if exists "oi_write" on public.order_items;
create policy "oi_write" on public.order_items for all to authenticated using (public.current_role() in ('admin','user')) with check (public.current_role() in ('admin','user'));

drop policy if exists "pay_read" on public.payments;
create policy "pay_read" on public.payments for select to authenticated using (public.current_role() = 'admin');
drop policy if exists "pay_insert" on public.payments;
create policy "pay_insert" on public.payments for insert to authenticated with check (public.current_role() = 'admin');
