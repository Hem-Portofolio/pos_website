import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { rupiah } from "../../lib/format";
import { api } from "../../lib/api";
import { categories as fallbackCats } from "../../data/mock";
import { useCartStore } from "../../stores/cartStore";
import { useAuthStore } from "../../stores/authStore";

export default function POSTerminal() {
  const [cats, setCats] = useState(fallbackCats);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const { items, add, inc, dec, remove, total, count, tableId, setTable, clear } = useCartStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [customerName, setCustomerName] = useState("");
  const [showPay, setShowPay] = useState(null); // order to pay
  const [method, setMethod] = useState("cash");
  const [paid, setPaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type:"", text:"" });
  const [receipt, setReceipt] = useState(null);

  async function loadMenu(){ try{ const r=await api.get("/api/menu"); setMenu(r.data||[]);}catch{} }
  async function loadCats(){ try{ const r=await api.get("/api/menu/categories"); if(r.data?.length) setCats(r.data);}catch{} }
  async function loadTables(){ try{ const r=await api.get("/api/tables"); setTables(r.data||[]);}catch{} }
  async function loadOrders(){ try{ const r=await api.get("/api/orders"); setActiveOrders((r.data||[]).filter(o=>["pending","cooking","ready"].includes(o.status))); }catch{} }

  useEffect(()=>{ loadMenu(); loadCats(); loadTables(); loadOrders(); const id=setInterval(loadOrders, 4000); return ()=>clearInterval(id); },[]);

  const filtered = menu.filter(m => {
    if (cat !== "all" && m.category_id !== cat) return false;
    if (q && !m.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const totalVal = total();
  const change = (Number(paid)||0) - (showPay?.total || 0);

  async function sendToKitchen(){
    if(!tableId){ setMsg({type:"error", text:"Pilih meja dulu."}); return; }
    if(!customerName.trim()){ setMsg({type:"error", text:"Isi nama pelanggan dulu."}); return; }
    if(items.length===0) return;
    setLoading(true);
    try{
      await api.post("/api/orders", { table_id: tableId, customer_name: customerName.trim(), items: items.map(it=>({ menu_item_id: it.menu_item_id, qty: it.qty, note: it.note||null })) });
      setMsg({type:"success", text:`Pesanan a.n ${customerName} (Meja ${tables.find(t=>t.id===tableId)?.number}) dikirim ke dapur.`});
      clear(); setCustomerName(""); loadOrders(); loadTables();
      setTimeout(()=>setMsg({type:"",text:""}),3000);
    }catch(e){ setMsg({type:"error", text:e.message}); }
    finally{ setLoading(false); }
  }

  function downloadPDF(){
    if(!receipt) return;
    const doc = new jsPDF({ unit:"mm", format:[80, 200] });
    let y = 10;
    doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.text("Warung POS", 40, y, {align:"center"}); y+=4;
    doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.text("Jl. Contoh No.12  |  0812-0000-0000", 40, y, {align:"center"}); y+=3;
    doc.text(receipt.date.toLocaleString("id-ID"), 40, y, {align:"center"}); y+=4;
    doc.setDrawColor(200); doc.line(5,y,75,y); y+=4;
    doc.setFontSize(8);
    doc.text(`Pelanggan: ${receipt.order.customer_name}`, 5, y); y+=4;
    doc.text(`Meja: ${receipt.order.table_number}   Order: #${receipt.order.id.slice(0,8)}`, 5, y); y+=4;
    doc.text(`Metode: ${receipt.method.toUpperCase()}`, 5, y); y+=4;
    doc.line(5,y,75,y); y+=4;
    receipt.order.items.forEach(it=>{
      doc.text(`${it.qty}x ${it.menu_name}`, 5, y);
      doc.text(rupiah(it.subtotal), 75, y, {align:"right"});
      y+=4;
    });
    doc.line(5,y,75,y); y+=4;
    doc.setFont("helvetica","bold"); doc.text("TOTAL", 5, y); doc.text(rupiah(receipt.order.total), 75, y, {align:"right"}); y+=5;
    if(receipt.method==="cash"){
      doc.setFont("helvetica","normal"); doc.setFontSize(7);
      doc.text("Bayar", 5, y); doc.text(rupiah(receipt.paid), 75, y, {align:"right"}); y+=3;
      doc.text("Kembali", 5, y); doc.text(rupiah(receipt.change), 75, y, {align:"right"}); y+=4;
    }
    doc.setFontSize(7); doc.text("Terima kasih - Sampai jumpa lagi!", 40, y, {align:"center"});
    doc.save(`struk-${receipt.order.customer_name}-${receipt.order.table_number}.pdf`);
  }

  async function confirmPay(){
    if(!showPay) return;
    if(!isAdmin){ setMsg({type:"error", text:"Hanya admin yang bisa melakukan pembayaran."}); return; }
    if(method==="cash" && change<0) return;
    setLoading(true);
    try{
      await api.post("/api/payments", { order_id: showPay.id, method, amount: showPay.total });
      const r = { order: showPay, method, paid: method==="cash" ? Number(paid) : showPay.total, change: method==="cash" ? Math.max(0, change) : 0, date: new Date() };
      setReceipt(r);
      setMsg({type:"success", text:`Pembayaran a.n ${showPay.customer_name} berhasil — ${rupiah(showPay.total)} (${method.toUpperCase()})`});
      setShowPay(null); setPaid(""); loadOrders(); loadTables();
      setTimeout(()=>setMsg({type:"",text:""}),3500);
    }catch(e){ setMsg({type:"error", text:e.message}); }
    finally{ setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-none tracking-tight">Kasir</h1>
          <p className="text-sm text-stone-600 mt-1.5">{isAdmin ? "Buat pesanan → masuk dapur → bayar setelah siap." : "Buat pesanan → masuk dapur → admin akan proses pembayaran."}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-full pl-3 pr-2 py-1.5 shadow-card">
          <span className="text-xs font-bold text-stone-600">Meja</span>
          <select value={tableId||""} onChange={e=>setTable(e.target.value||null)} className="h-7 pl-2 pr-6 rounded-full bg-stone-50 border border-stone-200 text-sm font-medium">
            <option value="">— Pilih —</option>
            {tables.map(t=><option key={t.id} value={t.id}>Meja {t.number} · {t.status==="available"?"Kosong":t.status==="occupied"?"Terisi":"Reservasi"}</option>)}
          </select>
        </div>
      </div>

      {msg.text && <div className={`rounded-xl border text-sm px-4 py-3 ${msg.type==="success"?"bg-sage/10 border-sage/30 text-[#1f4d1f]":"bg-red-50 border-red-200 text-red-700"}`}>{msg.text}</div>}
      {!isAdmin && <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">Kamu login sebagai <b>User</b> — hanya bisa pesan. Pembayaran hanya oleh <b>Admin</b> di halaman ini.</div>}

      <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
        <div className="space-y-3">
          <div className="bg-white border border-stone-200 rounded-2xl p-2 flex flex-wrap gap-1.5 items-center shadow-card">
            <button onClick={()=>setCat("all")} className={`px-3.5 h-7 rounded-full text-xs font-bold border ${cat==="all"?"bg-ink text-white border-ink":"bg-stone-50 border-stone-200"}`}>Semua</button>
            {cats.map(c=><button key={c.id} onClick={()=>setCat(c.id)} className={`px-3.5 h-7 rounded-full text-xs font-bold border ${cat===c.id?"bg-ink text-white border-ink":"bg-stone-50 border-stone-200"}`}>{c.name}</button>)}
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari menu…" className="ml-auto flex-1 sm:flex-none sm:w-[200px] h-8 px-3 rounded-full border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(m=>(
              <button key={m.id} onClick={()=>m.is_available && add({id:m.id,name:m.name,price:m.price,image_url:""})} disabled={!m.is_available}
                className={`text-left bg-white border rounded-2xl p-4 flex flex-col gap-1.5 hover:border-brass transition ${!m.is_available?"opacity-40":"shadow-card hover:shadow-paper"}`}>
                <div className="flex justify-between gap-2"><span className="text-sm font-semibold leading-tight line-clamp-2 flex-1">{m.name}</span>{!m.is_available && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 border">Habis</span>}</div>
                <div className="text-xs text-stone-600">{cats.find(c=>c.id===m.category_id)?.name||m.category_name||""}</div>
                <div className="flex items-center justify-between mt-1"><span className="text-sm font-bold tabular">{rupiah(m.price)}</span><span className="text-xs font-bold text-terracotta">+ Tambah</span></div>
              </button>
            ))}
            {filtered.length===0 && <div className="col-span-full py-10 text-center text-sm text-stone-600 bg-white border border-dashed rounded-2xl">Tidak ada menu.</div>}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
              <h3 className="text-sm font-bold">Keranjang</h3><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border tabular">{count()} item</span>
            </div>
            <CardBody className="min-h-[180px] space-y-3">
              <label className="block"><span className="text-xs font-bold tracking-wide uppercase text-stone-600">Atas nama</span>
                <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nama pelanggan" className="mt-1 w-full h-9 px-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
              </label>
              {!customerName.trim() && items.length>0 && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">Isi nama pelanggan sebelum kirim.</p>}
              {items.length===0 ? (
                <div className="py-4 text-center"><p className="text-sm font-medium">Keranjang kosong</p><p className="text-xs text-stone-600 mt-1">Pilih menu di samping.</p></div>
              ) : (
                <div className="space-y-2">
                  {items.map(it=>(
                    <div key={it.menu_item_id} className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{it.name}</div><div className="text-xs text-stone-600 tabular">{rupiah(it.price)} × {it.qty}</div></div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="text-sm font-bold tabular">{rupiah(it.price*it.qty)}</div>
                        <div className="flex items-center gap-1">
                          <button onClick={()=>dec(it.menu_item_id)} className="h-7 w-7 rounded-full bg-white border grid place-items-center">−</button>
                          <span className="w-6 text-center text-sm font-bold tabular">{it.qty}</span>
                          <button onClick={()=>inc(it.menu_item_id)} className="h-7 w-7 rounded-full bg-white border grid place-items-center">+</button>
                        </div>
                        <button onClick={()=>remove(it.menu_item_id)} className="text-xs text-red-600 hover:underline">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
            <div className="p-4 bg-white border-t border-stone-100 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-stone-600">Total</span><span className="font-display font-extrabold text-lg tabular">{rupiah(totalVal)}</span></div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={clear} disabled={items.length===0 || loading}>Kosongkan</Button>
                <Button onClick={sendToKitchen} disabled={items.length===0 || !tableId || !customerName.trim() || loading}>{loading?"Mengirim…":"Kirim ke dapur"}</Button>
              </div>
              {!tableId && <p className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-2">Pilih meja dulu.</p>}
            </div>
          </Card>

          <Card>
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-bold">Pesanan aktif</h3><button onClick={loadOrders} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-50 border">Muat ulang</button>
            </div>
            <div className="divide-y divide-stone-100">
              {activeOrders.length===0 ? (
                <div className="p-6 text-center text-sm text-stone-600">Belum ada pesanan aktif. Kirim dari keranjang di atas.</div>
              ) : activeOrders.map(o=>(
                <div key={o.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-none truncate">Meja {o.table_number ?? "?"} · {o.customer_name || "Tanpa nama"}</div>
                    <div className="text-xs text-stone-600 mt-0.5 flex items-center gap-2"><Badge status={o.status}>{o.status}</Badge> <span className="tabular">{rupiah(o.total)}</span> · <span>{o.items?.length||0} item</span></div>
                  </div>
                  {isAdmin ? (
                    <Button size="sm" onClick={()=>{ setShowPay(o); setMethod("cash"); setPaid(""); }}>Bayar</Button>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 border text-stone-500">Menunggu admin</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {showPay && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40 backdrop-blur-sm" onClick={()=>setShowPay(null)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-[440px] bg-white rounded-2xl shadow-paper overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-sm">Bayar — {showPay.customer_name} (Meja {showPay.table_number})</h3>
              <button onClick={()=>setShowPay(null)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-stone-100">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-stone-50 border p-3 space-y-1 text-sm">
                {(showPay.items||[]).map((it,i)=><div key={i} className="flex justify-between"><span>{it.qty}× {it.menu_name}</span><span className="tabular">{rupiah(it.subtotal)}</span></div>)}
                <div className="flex justify-between font-bold pt-2 border-t border-dashed"><span>Total</span><span className="tabular">{rupiah(showPay.total)}</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{id:"cash",label:"Tunai"},{id:"qris",label:"QRIS"},{id:"debit",label:"Debit"}].map(m=>(
                  <button key={m.id} onClick={()=>setMethod(m.id)} className={`h-10 rounded-xl border text-sm font-bold ${method===m.id?"bg-ink text-white border-ink":"bg-white border-stone-200"}`}>{m.label}</button>
                ))}
              </div>
              {method==="cash" && (
                <label className="block"><span className="text-xs font-bold text-stone-600">Uang diterima</span>
                  <input type="number" value={paid} onChange={e=>setPaid(e.target.value)} placeholder="50000" className="mt-1.5 w-full h-11 px-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brass focus:outline-none" />
                  <div className="text-xs mt-1.5 tabular">Kembalian: <b className={change<0?"text-red-600":"text-sage"}>{rupiah(Math.max(0, change))}</b></div>
                </label>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={()=>setShowPay(null)} disabled={loading}>Batal</Button>
                <Button onClick={confirmPay} disabled={loading || (method==="cash" && change<0)}>{loading?"Memproses…":"Konfirmasi Bayar"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40 backdrop-blur-sm">
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-[400px] bg-white rounded-2xl shadow-paper overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-sm">Pembayaran berhasil</h3>
              <button onClick={()=>setReceipt(null)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-stone-100">✕</button>
            </div>
            <div className="p-5">
              <div className="print-card bg-white border border-dashed border-stone-300 rounded-xl p-4 text-sm" id="struk-print">
                <div className="text-center">
                  <div className="font-display font-extrabold text-lg tracking-tight">Warung POS</div>
                  <div className="text-xs text-stone-600">Jl. Contoh No.12 · 0812-0000-0000</div>
                  <div className="text-xs text-stone-500 mt-1">{receipt.date.toLocaleString("id-ID")}</div>
                </div>
                <div className="h-px bg-stone-200 my-3" />
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-stone-600">Pelanggan</span><span className="font-semibold">{receipt.order.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">Meja</span><span className="font-semibold">{receipt.order.table_number}</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">Order</span><span className="font-mono text-xs">#{receipt.order.id.slice(0,8)}</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">Metode</span><span className="font-semibold uppercase">{receipt.method}</span></div>
                </div>
                <div className="h-px border-t border-dashed border-stone-300 my-3" />
                {(receipt.order.items||[]).map((it,i)=>(
                  <div key={i} className="flex justify-between gap-3 text-sm py-0.5">
                    <span>{it.qty}× {it.menu_name}</span>
                    <span className="tabular font-medium">{rupiah(it.subtotal)}</span>
                  </div>
                ))}
                <div className="h-px border-t border-dashed border-stone-300 my-3" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between font-bold"><span>TOTAL</span><span className="tabular">{rupiah(receipt.order.total)}</span></div>
                  {receipt.method==="cash" && (
                    <>
                      <div className="flex justify-between text-xs"><span className="text-stone-600">Bayar</span><span className="tabular">{rupiah(receipt.paid)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-stone-600">Kembali</span><span className="tabular font-bold">{rupiah(receipt.change)}</span></div>
                    </>
                  )}
                </div>
                <div className="text-center text-xs text-stone-600 mt-4 leading-relaxed">Terima kasih<br/>Sampai jumpa lagi!</div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="ghost" onClick={()=>setReceipt(null)}>Tutup</Button>
                <Button onClick={downloadPDF}>Unduh PDF</Button>
              </div>
              <p className="text-xs text-center text-stone-500 mt-2">Struk diunduh sebagai PDF 80mm — tanpa dialog print browser.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
