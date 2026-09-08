import { useEffect, useState } from "react";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { rupiah } from "../../lib/format";
import { api } from "../../lib/api";
import { useCartStore } from "../../stores/cartStore";

export default function TableMap(){
  const [tables, setTables] = useState([]);
  const [cats, setCats] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeTable, setActiveTable] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ type:"", text:"" });
  const { items, add, inc, dec, tableId, setTable, clear } = useCartStore();

  useEffect(()=>{
    api.get("/api/tables").then(r=>setTables(r.data||[])).catch(()=>{});
    api.get("/api/menu").then(r=>setMenu(r.data||[])).catch(()=>{});
    api.get("/api/menu/categories").then(r=>{ if(r.data?.length) setCats(r.data); }).catch(()=>{});
  },[]);

  const filtered = menu.filter(m=>{
    if(cat!=="all" && m.category_id!==cat) return false;
    if(q && !m.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  function openTable(t){ setActiveTable(t); setTable(t.id); }
  const total = items.reduce((a,b)=>a+b.price*b.qty,0);

  async function sendToKitchen(){
    if (!activeTable || items.length===0) return;
    if (!customerName.trim()){ setMsg({type:"error", text:"Isi nama pelanggan dulu."}); return; }
    setSending(true); setMsg({ type:"", text:"" });
    try {
      await api.post("/api/orders", {
        table_id: activeTable.id,
        customer_name: customerName.trim(),
        items: items.map(it=>({ menu_item_id: it.menu_item_id, qty: it.qty, note: it.note || null }))
      });
      setMsg({ type:"success", text:`Pesanan a.n ${customerName} (Meja ${activeTable.number}) terkirim ke dapur`});
      clear(); setCustomerName("");
      api.get("/api/tables").then(r=>setTables(r.data||[])).catch(()=>{});
      setTimeout(()=>setMsg({ type:"", text:""}), 3500);
    } catch (e) {
      setMsg({ type:"error", text: e.message });
    } finally { setSending(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight leading-none">Pelayan</h1>
          <p className="text-sm text-stone-600 mt-1.5">Pilih meja, susun pesanan, kirim ke dapur.</p>
        </div>
        {msg.text && (
          <div className={`text-sm px-3 py-2 rounded-xl border ${msg.type==="success"?"bg-sage/10 border-sage/30 text-[#2F5D2F]":"bg-red-50 border-red-200 text-red-700"}`}>{msg.text}</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-sage/[0.06] border-sage/20"><CardBody className="py-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-stone-600">Kosong</span><span className="font-display font-bold text-lg tabular">{tables.filter(t=>t.status==="available").length}</span></CardBody></Card>
        <Card className="bg-terracotta/[0.04] border-terracotta/15"><CardBody className="py-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-stone-600">Terisi</span><span className="font-display font-bold text-lg tabular">{tables.filter(t=>t.status==="occupied").length}</span></CardBody></Card>
        <Card className="bg-amber-50 border-amber-200"><CardBody className="py-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-stone-600">Reservasi</span><span className="font-display font-bold text-lg tabular">{tables.filter(t=>t.status==="reserved").length}</span></CardBody></Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {tables.map(t=>(
          <button
            key={t.id}
            onClick={()=>openTable(t)}
            className={`rounded-2xl border p-4 text-left transition ${t.status==="occupied"?"bg-ink text-white border-ink":t.status==="reserved"?"bg-white border-amber-300":"bg-white hover:border-brass"} ${activeTable?.id===t.id?"ring-2 ring-brass ring-offset-1":"shadow-card hover:shadow-paper"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className={`text-[11px] font-bold tracking-[0.08em] uppercase ${t.status==="occupied"?"text-white/60":"text-stone-500"}`}>Meja</div>
                <div className="font-display font-bold text-[28px] leading-none">{t.number}</div>
              </div>
              <Badge status={t.status}>{t.status==="available"?"Kosong":t.status==="occupied"?"Terisi":"Reservasi"}</Badge>
            </div>
            <div className={`text-xs mt-3 ${t.status==="occupied"?"text-white/70":"text-stone-600"}`}>Tap untuk pesan</div>
          </button>
        ))}
        {tables.length===0 && <div className="col-span-full py-8 text-center text-sm text-stone-600 bg-white border border-dashed rounded-2xl">Memuat meja…</div>}
      </div>

      {activeTable && (
        <Card className="overflow-hidden border-stone-200 shadow-paper">
          <div className="px-4 py-3 border-b border-stone-100 flex flex-wrap items-center gap-3 justify-between bg-stone-50/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-ink text-white grid place-items-center font-display font-bold text-sm">{activeTable.number}</div>
              <div>
                <div className="text-sm font-bold leading-none">Meja {activeTable.number}</div>
                <div className="text-xs text-stone-600">{items.length} item {tableId===activeTable.id? "· aktif":""}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tabular hidden sm:inline">{rupiah(total)}</span>
              <Button size="sm" disabled={items.length===0 || sending || !customerName.trim()} onClick={sendToKitchen}>{sending? "Mengirim…":"Kirim ke dapur"}</Button>
              <button onClick={()=>setActiveTable(null)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white border border-transparent hover:border-stone-200">✕</button>
            </div>
          </div>
          <div className="grid lg:grid-cols-[1fr_340px] gap-0">
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <button onClick={()=>setCat("all")} className={`px-3 h-7 rounded-full text-xs font-bold border ${cat==="all"?"bg-ink text-white border-ink":"bg-white border-stone-200"}`}>Semua</button>
                {cats.map(c=><button key={c.id} onClick={()=>setCat(c.id)} className={`px-3 h-7 rounded-full text-xs font-bold border ${cat===c.id?"bg-ink text-white border-ink":"bg-white border-stone-200"}`}>{c.name}</button>)}
              </div>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari menu…" className="w-full h-9 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass" />
              <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-auto pr-1">
                {filtered.map(m=>(
                  <button key={m.id} onClick={()=>add({ id: m.id, name: m.name, price: m.price, image_url: "" })} disabled={!m.is_available} className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left bg-white hover:border-brass transition ${!m.is_available?"opacity-40":""}`}>
                    <div className="min-w-0"><div className="text-sm font-semibold leading-tight truncate">{m.name}</div><div className="text-xs tabular text-stone-600">{rupiah(m.price)}</div></div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-terracotta text-white shrink-0">+ Tambah</span>
                  </button>
                ))}
                {filtered.length===0 && <div className="py-8 text-center text-sm text-stone-600">Tidak ada menu.</div>}
              </div>
            </div>
            <div className="p-4 space-y-3 bg-stone-50 border-t lg:border-t-0 lg:border-l border-stone-100">
              <div className="space-y-2">
                <label className="block"><span className="text-xs font-bold tracking-wide uppercase text-stone-600">Atas nama</span>
                  <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nama pelanggan" className="mt-1 w-full h-9 px-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                </label>
                {!customerName.trim() && items.length>0 && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">Isi nama pelanggan sebelum kirim.</p>}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-600">Pesanan</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white border tabular">{items.length} item</span>
              </div>
              {items.length===0 ? (
                <div className="py-10 text-center text-sm text-stone-600">Belum ada item. Pilih menu di kiri.</div>
              ) : (
                <div className="space-y-2">
                  {items.map(it=>(
                    <div key={it.menu_item_id} className="flex items-center gap-2 bg-white border rounded-xl p-2.5">
                      <span className="flex-1 text-sm font-medium truncate">{it.name}</span>
                      <span className="text-xs tabular font-medium">{rupiah(it.price)}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>dec(it.menu_item_id)} className="h-7 w-7 rounded-full border bg-white grid place-items-center">−</button>
                        <span className="w-6 text-center text-sm font-bold tabular">{it.qty}</span>
                        <button onClick={()=>inc(it.menu_item_id)} className="h-7 w-7 rounded-full border bg-white grid place-items-center">+</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-3 border-t border-dashed text-sm"><span>Total</span><span className="tabular">{rupiah(total)}</span></div>
                  <p className="text-xs text-stone-600 leading-relaxed">Setelah dikirim, pesanan muncul di <b>Layar Dapur</b> dan bisa dibayar di <b>Kasir</b>.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
