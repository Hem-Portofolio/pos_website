# AGENTS.md — Warung POS

## Stack & Structure
- Monorepo, no root `package.json`. Two independent packages:
  - `backend/` — Express 5, ESM (`"type":"module"`), Supabase + `pg`. Entrypoint `backend/server.js` (exports `app`; listens only if `VERCEL!=1`). Vercel handler `backend/api/index.js` re-exports app.
  - `frontend/` — Vite 8 + React 19 + Zustand + TanStack Query + Tailwind 3. Entrypoint `frontend/src/main.jsx` → `App.jsx` → `routes/router.jsx`.
- DB: Supabase Postgres. Schema + RLS in `backend/migrations/001_pos_schema.sql` (run manually in Supabase SQL Editor, requires `pgcrypto`).

## Commands
```bash
# Backend (port 5000)
cd backend && npm install && npm run dev   # or npm start (same: node server.js)

# Frontend (port 5173, proxies /api → localhost:5000)
cd frontend && npm install && npm run dev
cd frontend && npm run build   # vite build → dist/
cd frontend && npm run lint    # oxlint (not eslint)
cd frontend && npm run preview
```
- No tests configured — `backend` `npm test` just exits 1, frontend has no test script. No root task runner, no CI workflows, no pre-commit hooks.
- Vercel: root `vercel.json` builds `frontend` (SPA rewrite to `/index.html`); `backend/vercel.json` routes all to `api/index.js`.

## Env
```bash
# backend/.env  (see .env.example)
SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_KEY / SUPABASE_JWT_SECRET
CORS_ORIGINS=http://localhost:5173,http://localhost:3000  # comma-split whitelist; missing origin → 403
PORT=5000 / NODE_ENV / ALLOW_MOCK=true   # ALLOW_MOCK needed for mock tokens in production
DATABASE_URL / DIRECT_URL                # optional pg pool (pooler 6543 / direct 5432, ssl rejectUnauthorized:false)

# frontend/.env
VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
VITE_API_URL=http://localhost:5000       # if empty, fetch uses relative "" → needs Vite proxy
```
- Never commit `.env`. Both packages have `.env.example`.

## Auth — Mock vs Supabase
- Backend `src/middleware/authMiddleware.js:10` accepts `mock.jwt.<role>.<ts>` tokens. Allowed only if `NODE_ENV!=production` OR `ALLOW_MOCK=true`. Role must be `admin|user` (legacy kasir/waiter/dapur → user via `002_simplify_roles.sql`).
- Real tokens verified via `supabase.auth.getUser(token)` then role looked up from `users` table via `supabaseAdmin` (service key bypasses RLS), fallback `user.user_metadata.role` (default `user`).
- Frontend `src/stores/authStore.js` is mock-only (Zustand + `localStorage` `token`/`wp_user`), calls `demoUsers` from `src/data/mock.js`. Demo logins (`frontend/src/data/mock.js:52`): `admin@warungpos.id/admin123`, `user@warungpos.id/user123`. `GET /api/auth/me` goes through `lib/api.js` which always sends `Authorization: Bearer <token>`.

## Backend Conventions
- All responses `{ success, data, message }` (`backend/server.js:48-49`). Indonesian messages.
- Middleware: `helmet` (CSP off), CORS whitelist, `express.json({limit:"100kb"})`, `auditLog`, rate limiters — `authLimiter` 20/15min on `/api/auth`, `payLimiter` 30/min on `/api/payments`.
- Routes: `src/routes/{auth,menu,orders,tables,payments}.js` → `src/controllers/` → `src/config/supabase.js` (`supabaseAnon`/`supabaseAdmin`) or `src/config/db.js` (`pg.Pool`).
- Health check `GET /health`. 404 JSON handler before error handler (error handler hides stack in production).
- ESM everywhere — use `import`/`export`, `.js` extensions required.

## Frontend Conventions
- Routing (`src/routes/router.jsx:12`): `Guard` reads `authStore.user.role`. `/admin*` admin-only, `/pos`+`/waiter` admin/user (ordering), `/kitchen` admin-only. Unauthenticated → `/login`.
- State: `stores/authStore.js` + `stores/cartStore.js` (Zustand), server state via TanStack Query. API helper `lib/api.js` uses `VITE_API_URL` base + localStorage token.
- Supabase client `lib/supabase.js` is `null` if env missing — app runs in mock mode via `data/mock.js` (categories, menuItems, tables, ordersMock).
- KDS realtime: `supabase.channel('kitchen').on('postgres_changes', {table:'orders'})` (documented in README, not polling).
- Design tokens in `tailwind.config.js:6` (`ink`, `paper`, `stone`, `terracotta`, `brass`, `sage`, `amber` + `shadow.paper/card`). See `DESIGN.md` for palette/typography — paper #FFFDF7, ink #0F1115, terracotta #E84C2F primary, brass #C9A86A highlight. Print receipts via `window.print()` + `@media print` (see `PRODUCT.md`).
- Lint: `oxlint` with `frontend/.oxlintrc.json` (`react/rules-of-hooks` error).
- SPA routing: Vite proxy `/api` → `localhost:5000` in dev; production Vercel rewrite in root `vercel.json:5`.

## Gotchas
- Migration is manual — no `prisma migrate` / codegen pipeline despite `README.md:37` mentioning Prisma. Just run SQL in Supabase editor.
- `VITE_API_URL` defaults to `""` — frontend calls become relative; without Vite proxy they 404 in dev.
- `ALLOW_MOCK=true` must be set on Vercel env if demo logins should work in production.
- CORS `origin: undefined` (e.g. curl, server-side) is allowed (`server.js:26`); browser origins not in `CORS_ORIGINS` get 403.
- `frontend/dist` and `backend/.vercel` are gitignored build artifacts — root Vercel `outputDirectory` is `frontend/dist`.
