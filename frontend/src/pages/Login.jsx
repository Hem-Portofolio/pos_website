import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const roleRedirect = { admin: "/admin", kasir: "/pos", waiter: "/waiter", dapur: "/kitchen" };

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const u = await login(email, pass);
      nav(roleRedirect[u.role] || "/admin");
    } catch (e2) { setErr(e2.message); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* thin brass top rule */}
      <div className="h-1 w-full bg-gradient-to-r from-brass via-terracotta to-ink opacity-90" />
      <div className="flex-1 grid lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left — editorial */}
        <div className="relative overflow-hidden bg-ink text-white flex flex-col">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "20px 20px" }} />
          <div className="absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-white/[0.04] blur-[1px]" />
          <div className="absolute -left-16 bottom-24 h-[260px] w-[260px] rounded-full border border-white/10" />

          <div className="relative p-7 sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/60">Warung POS · Sejak 2024</span>
            </div>
            <h1 className="font-display font-extrabold leading-[0.88] tracking-tight text-[42px] sm:text-[54px] lg:text-[58px] mt-5 text-balance">
              Kasir<br className="hidden sm:block" /> cepat.<br />
              Dapur <span className="text-terracotta">selaras.</span><br />
              <span className="text-white">Laporan</span> jelas.
            </h1>
            <p className="text-white/70 mt-4 max-w-[50ch] text-[15px] leading-relaxed">
              Satu layar untuk pelayan, kasir, dapur, dan owner. Pesanan dari meja langsung tercetak di dapur secara realtime — tanpa nota hilang.
            </p>

            <div className="mt-7 grid grid-cols-3 gap-3 max-w-[520px]">
              {[
                { k: "Pesanan", v: "Realtime" },
                { k: "Meja", v: "12" },
                { k: "Waktu", v: "Live" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/[0.07] border border-white/10 px-4 py-3">
                  <div className="text-[11px] font-bold tracking-wide uppercase text-white/55">{s.k}</div>
                  <div className="font-display font-bold text-[18px] tracking-tight">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-auto p-7 sm:p-10 lg:p-12 pt-0">
            {/* ticket */}
            <div className="relative max-w-[520px] bg-white text-ink rounded-2xl shadow-paper overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-terracotta" />
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-stone-500">Tiket Dapur</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Menunggu
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-bold text-[18px] tracking-tight">#1024 · Meja 7</span>
                    <span className="text-xs font-bold tracking-wide text-stone-600">a.n Sari · 02:14</span>
                  </div>
                  <div className="mt-3 border-t border-dashed border-stone-200" />
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><span className="font-medium">1× Nasi Goreng Kampung</span><span className="text-xs font-semibold px-2 py-1 rounded-full bg-stone-50 border">Pedas sedang</span></div>
                    <div className="flex justify-between gap-4"><span className="font-medium">2× Es Teh Manis</span><span className="text-xs text-stone-500">—</span></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-bold tracking-wide uppercase text-stone-500">Warung POS</span>
                    <span className="tabular font-semibold">3 item · Rp 48.000</span>
                  </div>
                </div>
              </div>
              {/* perforation */}
              <div className="h-3 relative bg-white flex items-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-stone-300" />
                <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-ink" />
                <span className="absolute -right-1.5 h-3 w-3 rounded-full bg-ink" />
              </div>
              <div className="px-4 sm:px-5 pb-4 pt-2 flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase text-stone-500">
                <span>Operasional · Realtime</span><span className="tabular">12:32 WIB</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/45">Data ilustratif — tiket nyata akan muncul di Layar Dapur.</div>
          </div>
        </div>

        {/* Right — form */}
        <div className="relative flex flex-col justify-center bg-paper p-6 sm:p-10 lg:p-12">
          <div className="absolute inset-0 hidden lg:block opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, #0F1115 1px, transparent 1px), linear-gradient(to bottom, #0F1115 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative w-full max-w-[420px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-ink text-white grid place-items-center shadow-card">
                <span className="font-display font-extrabold text-sm tracking-tight">W</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-tight">Warung POS</div>
                <div className="text-xs font-semibold tracking-wide uppercase text-stone-500">Masuk · Aman & Cepat</div>
              </div>
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-sage/10 border border-sage/20 text-[#1f4d1f]"><span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse"/> Live</span>
            </div>

            <div className="mt-8 rounded-2xl bg-white border border-stone-200 shadow-paper p-6 sm:p-7">
              <h2 className="font-display text-[26px] font-bold tracking-tight leading-none">Masuk</h2>
              <p className="text-sm text-stone-600 mt-1.5">Gunakan akun yang terdaftar di sistem.</p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <Input label="Email" type="email" placeholder="nama@warungpos.id" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Kata sandi" type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} required />
                {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3.5 py-2.5 leading-relaxed">{err}</div>}
                <Button type="submit" className="w-full shadow-card" size="lg" disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Memproses…</span>
                  ) : "Masuk"}
                </Button>
                <p className="text-xs text-center text-stone-500 leading-relaxed">
                  Hubungi owner untuk reset sandi atau tambah staf di <span className="font-semibold text-stone-700">Kelola Menu</span>.
                </p>
              </form>
            </div>

            <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 flex items-start gap-3">
              <span className="mt-0.5 h-6 w-6 rounded-full bg-brass/20 border border-brass/30 grid place-items-center text-[11px] font-bold text-[#6B4F1D]">i</span>
              <p className="text-xs leading-relaxed text-stone-600">
                <span className="font-bold text-stone-700">Tips:</span> Owner → Ringkasan & Laporan, Kasir → POS, Pelayan → Peta Meja, Dapur → Layar Dapur. Semua sinkron realtime.
              </p>
            </div>

            <div className="mt-6 text-center text-xs text-stone-500">© Warung POS · Dibuat untuk operasional harian</div>
          </div>
        </div>
      </div>
    </div>
  );
}
