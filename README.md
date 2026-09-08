# Warung POS — Restoran POS (Node + Supabase + React)

## Menjalankan
### 1. Backend
```bash
cd backend
cp .env.example .env   # isi SUPABASE_URL, ANON_KEY, SERVICE_KEY
npm install
npm run dev            # http://localhost:5000
```
Migration: jalankan `backend/migrations/001_pos_schema.sql` di Supabase SQL Editor.

### 2. Frontend
```bash
cd frontend
cp .env.example .env   # isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev            # http://localhost:5173
```

Login demo (tanpa Supabase juga jalan via mock):
- admin@warungpos.id / admin123 → /admin
- kasir@warungpos.id / kasir123 → /pos
- waiter@warungpos.id / waiter123 → /waiter
- dapur@warungpos.id / dapur123 → /kitchen

## Arsitektur
- Auth: Supabase Auth → JWT di `Authorization: Bearer <token>` → `authMiddleware` verifikasi via `supabase.auth.getUser()` → `roleMiddleware` cek `users.role` → RLS di DB.
- Realtime: `supabase.channel('kitchen').on('postgres_changes', {table: 'orders'})` di KDS.
- Response: `{ success, data, message }`.

## Struktur
- `backend/src/{config,routes,controllers,middleware}` · `migrations/`
- `frontend/src/{pages,components,stores,lib,data,routes}`

## Catatan
- Jangan commit `.env` berisi credential asli. Gunakan `.env.example`.
- Jika pakai Prisma, `DATABASE_URL` (pooler 6543) & `DIRECT_URL` (5432) via env.
