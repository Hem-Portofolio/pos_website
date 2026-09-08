import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";

// --- icons (stroke 1.7, 18px, Warung Modern — rounded, friendly) ---
const I = {
  grid: (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  cart: (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6h15l-1.5 9H7z"/><path d="M6 6L5 2H2"/><circle cx="9" cy="20" r="1.8"/><circle cx="18" cy="20" r="1.8"/></svg>,
  users: (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  flame: (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3s4 3.2 4 7a4 4 0 0 1-8 0c0-3.8 4-7 4-7z"/><path d="M9 13a3 3 0 0 0 6 0"/></svg>,
  book: (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19a2 2 0 0 0 2 2h12"/><path d="M4 5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2z"/></svg>,
  chart: (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><path d="M7 16l4-4 4 2 4-6"/></svg>,
};

const navByRole = {
  admin: [
    { section: "Operasional" },
    { to: "/admin", label: "Ringkasan", icon: I.grid, end: true },
    { to: "/pos", label: "Kasir", icon: I.cart },
    { to: "/waiter", label: "Pelayan", icon: I.users },
    { to: "/kitchen", label: "Dapur", icon: I.flame },
    { section: "Kelola" },
    { to: "/admin/menu", label: "Menu", icon: I.book },
    { to: "/admin/reports", label: "Laporan", icon: I.chart },
  ],
  kasir: [{ section: "Operasional" }, { to: "/pos", label: "Kasir", icon: I.cart }],
  waiter: [{ section: "Operasional" }, { to: "/waiter", label: "Pelayan", icon: I.users }, { to: "/pos", label: "Kasir", icon: I.cart }],
  dapur: [{ section: "Operasional" }, { to: "/kitchen", label: "Dapur", icon: I.flame }],
};

const roleLabel = { admin:"Owner", kasir:"Kasir", waiter:"Pelayan", dapur:"Dapur" };

export function AppShell({ children }) {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const items = navByRole[user?.role] || navByRole.admin;
  const activeItem = [...items].reverse().find(i=> i.to && loc.pathname.startsWith(i.to));

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[268px] shrink-0 flex-col sticky top-0 h-screen border-r border-stone-200 bg-white">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-ink text-white grid place-items-center shadow-card">
              <span className="font-display font-extrabold text-[15px] tracking-tight">W</span>
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-[15px] tracking-tight">Warung POS</div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-stone-500 uppercase">Warung Modern · Realtime</div>
            </div>
          </div>
        </div>

        <nav className="px-3 flex-1 overflow-y-auto">
          {items.map((it, idx) =>
            it.section ? (
              <div key={idx} className="mt-4 mb-2 px-3 text-[11px] font-bold tracking-[0.12em] uppercase text-stone-400">{it.section}</div>
            ) : (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 h-9 rounded-xl text-sm font-medium transition border ${isActive ? "bg-ink text-white border-ink shadow-card" : "border-transparent text-stone-700 hover:bg-stone-50 hover:border-stone-200"}`
                }
              >
                <it.icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
                <span className="truncate">{it.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="p-3 border-t border-stone-100 bg-stone-50/60">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white border border-stone-200 shadow-card">
            <div className="h-8 w-8 rounded-full bg-terracotta text-white grid place-items-center text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-stone-600 truncate">{roleLabel[user?.role] || user?.role}</div>
            </div>
          </div>
          <button
            onClick={()=>{ logout(); nav("/login"); }}
            className="mt-2 w-full h-8 rounded-xl bg-white border border-stone-200 text-xs font-bold hover:bg-stone-50 hover:border-stone-300 transition"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200">
          <div className="px-4 h-[52px] flex items-center gap-3">
            <button onClick={()=>setOpen(v=>!v)} className="h-9 w-9 grid place-items-center rounded-xl border border-stone-200 bg-white">
              <span className="space-y-1"><span className="block h-0.5 w-4 bg-ink rounded"/><span className="block h-0.5 w-4 bg-ink rounded"/><span className="block h-0.5 w-4 bg-ink rounded"/></span>
            </button>
            <div className="h-8 w-8 rounded-xl bg-ink text-white grid place-items-center font-display font-bold">W</div>
            <div className="leading-tight flex-1 min-w-0">
              <div className="text-sm font-bold tracking-tight truncate">{activeItem?.label || "Warung POS"}</div>
              <div className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase truncate">{roleLabel[user?.role]} · {user?.name}</div>
            </div>
            <button onClick={()=>{ logout(); nav("/login"); }} className="text-xs font-bold px-3 h-8 rounded-full bg-ink text-white">Keluar</button>
          </div>
          {open && (
            <div className="px-3 pb-3 border-t border-stone-100 bg-white">
              <nav className="pt-2 grid gap-1">
                {items.filter(i=>!i.section).map(it=>(
                  <NavLink key={it.to} to={it.to} end={it.end} onClick={()=>setOpen(false)}
                    className={({isActive})=> `flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-semibold border ${isActive?"bg-ink text-white border-ink":"bg-stone-50 border-stone-200 text-stone-700"}`}>
                    <it.icon className="h-[18px] w-[18px]"/> {it.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </header>

        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-7 pb-24 lg:pb-7">{children}</main>

        <footer className="hidden lg:flex border-t border-stone-200 bg-white/70 backdrop-blur">
          <div className="max-w-[1280px] mx-auto w-full px-6 h-9 flex items-center justify-between text-xs text-stone-500">
            <span>© Warung POS · Sistem kasir restoran</span>
            <span>Realtime · RLS per role</span>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 px-2 py-1.5">
        <div className="flex gap-1">
          {items.filter(i=>!i.section).slice(0,4).map(it=>(
            <NavLink key={it.to} to={it.to} end={it.end}
              className={({isActive})=> `flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl border text-[11px] font-bold ${isActive ? "bg-ink text-white border-ink shadow-card" : "bg-stone-50 border-stone-200 text-stone-700"}`}>
              <it.icon className="h-[18px] w-[18px]" />
              <span className="leading-none">{it.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
