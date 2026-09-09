import { useEffect, useState, useCallback } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { rupiah, elapsedSince } from "../../lib/format";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";

export default function KDS(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, tick] = useState(0);
  useEffect(()=>{ const id=setInterval(()=>tick(x=>x+1), 15000); return ()=>clearInterval(id); },[]);

  const load = useCallback(async()=>{
    try {
      const res = await api.get("/api/orders");
      // filter hanya yang belum paid/cancelled untuk dapur
      const active = (res.data||[]).filter(o=>["pending","cooking","ready"].includes(o.status));
      setOrders(active);
    } catch {}
    setLoading(false);
  },[]);
  useEffect(()=>{ load(); },[load]);
  // polling tiap 4 detik + realtime jika ada
  useEffect(()=>{
    const id=setInterval(load, 4000);
    return ()=>clearInterval(id);
  },[load]);
  useEffect(()=>{
    if(!supabase) return;
    const ch = supabase.channel("kitchen")
      .on("postgres_changes", { event:"*", schema:"public", table:"orders" }, ()=>load())
      .subscribe();
    return ()=>{ supabase.removeChannel(ch); };
  },[load]);

  async function move(id, status){
    setOrders(s=>s.map(o=>o.id===id?{...o,status}:o));
    try { await api.patch(`/api/orders/${id}/status`, { status }); } catch {}
    load();
  }

  const cols = [
    { key:"pending", label:"Menunggu", desc:"Baru masuk", color:"#E6A23C" },
    { key:"cooking", label:"Memasak", desc:"Sedang dimasak", color:"#E84C2F" },
    { key:"ready", label:"Siap saji", desc:"Siap antar", color:"#6B8F6B" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight leading-none">Layar Dapur</h1>
          <p className="text-sm text-stone-600 mt-1.5">Pesanan dari user muncul otomatis. Tap untuk ubah status (khusus admin).</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:bg-stone-50">Muat ulang</button>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${supabase ? "bg-sage/10 border-sage/30 text-[#2F5D2F]" : "bg-white border-stone-200 text-stone-600"}`}>
            <span className="h-2 w-2 rounded-full bg-current animate-pulse" /> {supabase ? "Realtime" : "Polling 4s"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-stone-600 bg-white border border-dashed rounded-2xl">Memuat pesanan…</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 items-start">
          {cols.map(col=>{
            const list = orders.filter(o=>o.status===col.key);
            return (
              <div key={col.key} className="rounded-2xl bg-stone-50 border border-stone-200 p-2.5">
                <div className="flex items-center justify-between px-2 py-2">
                  <div>
                    <div className="text-sm font-bold tracking-tight">{col.label}</div>
                    <div className="text-xs text-stone-600">{col.desc} · {list.length} tiket</div>
                  </div>
                  <span className="h-7 min-w-7 px-2 grid place-items-center rounded-full bg-white border text-xs font-bold tabular">{list.length}</span>
                </div>
                <div className="space-y-3 mt-1">
                  {list.length===0 ? (
                    <Card className="border-dashed bg-white"><div className="p-8 text-center text-sm text-stone-600">Tidak ada pesanan</div></Card>
                  ) : list.map(o=>(
                    <Card key={o.id} className="overflow-hidden bg-white">
                      <div className="h-1 w-full" style={{ background: col.color }} />
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold tracking-wide uppercase text-stone-600">Meja {o.table_number ?? "—"} · {o.customer_name || "Tanpa nama"}</div>
                            <div className="font-display font-bold text-base leading-none mt-0.5">Tiket #{o.id.slice(0,6).toUpperCase()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-stone-600">Waktu</div>
                            <div className="text-sm font-bold tabular">{elapsedSince(o.created_at)}</div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          {(o.items||[]).map((it, idx)=>(
                            <div key={idx} className="flex justify-between gap-3 text-sm">
                              <span className="font-medium">{it.qty}× {it.menu_name || it.menu_item_id}</span>
                              <span className="text-xs text-stone-600 self-center">{it.note || ""}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-px bg-stone-100 my-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-stone-600">{(o.items||[]).reduce((a,b)=>a+b.qty,0)} item · <span className="tabular font-bold">{rupiah(o.total)}</span></span>
                          <Badge status={o.status}>{col.label}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {col.key==="pending" && <><Button size="sm" onClick={()=>move(o.id,"cooking")}>Mulai masak</Button><Button size="sm" variant="ghost" onClick={()=>move(o.id,"ready")}>Langsung siap</Button></>}
                          {col.key==="cooking" && <><Button size="sm" onClick={()=>move(o.id,"ready")}>Tandai siap</Button><Button size="sm" variant="ghost" onClick={()=>move(o.id,"pending")}>Kembali</Button></>}
                          {col.key==="ready" && <><div className="col-span-2 text-xs text-center py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-medium">Menunggu pembayaran di kasir</div><Button size="sm" variant="ghost" onClick={()=>move(o.id,"cooking")} className="col-span-2">Kembalikan ke memasak</Button></>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl bg-ink text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span><b>Alur:</b> User pesan → Menunggu → Memasak → Siap → Bayar (meja kosong).</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/20">{orders.length} pesanan aktif</span>
      </div>
    </div>
  );
}
