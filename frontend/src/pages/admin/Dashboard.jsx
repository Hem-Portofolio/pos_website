import { useEffect, useState } from "react";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { rupiah, fmtDate } from "../../lib/format";
import { api } from "../../lib/api";

function isToday(iso){
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}
function toDateKey(iso){
  const d = new Date(iso);
  return d.toISOString().slice(0,10);
}
function last7Keys(){
  const arr=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    arr.push(d.toISOString().slice(0,10));
  }
  return arr;
}

export default function AdminDashboard() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(){
    try{
      const [tRes, oRes, mRes, pRes] = await Promise.all([
        api.get("/api/tables").catch(()=>({data:[]})),
        api.get("/api/orders").catch(()=>({data:[]})),
        api.get("/api/menu").catch(()=>({data:[]})),
        api.get("/api/payments").catch(()=>({data:[]})),
      ]);
      setTables(tRes.data||[]);
      setOrders(oRes.data||[]);
      setMenu(mRes.data||[]);
      setPayments(pRes.data||[]);
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); const id=setInterval(load, 10000); return ()=>clearInterval(id); },[]);

  const pending = orders.filter(o=>o.status==="pending").length;
  const activeOrders = orders.filter(o=>["pending","cooking","ready"].includes(o.status));
  const todayPayments = payments.filter(p=> isToday(p.paid_at || p.created_at));
  const todaySales = todayPayments.reduce((a,b)=>a+Number(b.amount||0),0);
  const occupied = tables.filter(t=>t.status==="occupied").length;
  const availableMenu = menu.filter(m=>m.is_available).length;

  // 7 hari
  const keys = last7Keys();
  const byDay = Object.fromEntries(keys.map(k=>[k,0]));
  payments.forEach(p=>{
    const k = toDateKey(p.paid_at || p.created_at || new Date().toISOString());
    if(k in byDay) byDay[k] += Number(p.amount||0);
  });
  const dayVals = keys.map(k=>byDay[k]);
  const maxVal = Math.max(1, ...dayVals);

  if(loading){
    return <div className="py-16 text-center text-sm text-stone-600">Memuat ringkasan…</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight leading-none">Ringkasan</h1>
          <p className="text-sm text-stone-600 mt-1.5">Penjualan, pesanan, dan meja — data live dari database.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:bg-stone-50">Muat ulang</button>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-sage animate-pulse" /> Live
          </span>
          <span className="text-xs text-stone-600">{fmtDate(new Date())}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-terracotta/20">
          <CardBody className="py-4">
            <div className="text-xs font-bold tracking-wide uppercase text-stone-600">Penjualan hari ini</div>
            <div className="font-display font-extrabold text-[22px] mt-1.5 tabular text-terracotta">{rupiah(todaySales)}</div>
            <div className="text-xs text-stone-600 mt-1">{todayPayments.length} transaksi · {todaySales===0?"belum ada":"hari ini"}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="text-xs font-bold tracking-wide uppercase text-stone-600">Pesanan aktif</div>
            <div className="font-display font-bold text-[22px] mt-1.5 tabular">{activeOrders.length} tiket</div>
            <div className="text-xs text-stone-600 mt-1">{pending} menunggu · {activeOrders.length-pending} proses</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="text-xs font-bold tracking-wide uppercase text-stone-600">Meja terisi</div>
            <div className="font-display font-bold text-[22px] mt-1.5 tabular">{occupied} / {tables.length || 12}</div>
            <div className="text-xs text-stone-600 mt-1">{tables.filter(t=>t.status==="available").length} kosong · {tables.filter(t=>t.status==="reserved").length} reservasi</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="text-xs font-bold tracking-wide uppercase text-stone-600">Menu tersedia</div>
            <div className="font-display font-bold text-[22px] mt-1.5 tabular">{availableMenu} menu</div>
            <div className="text-xs text-stone-600 mt-1">{menu.length - availableMenu} habis · {menu.length} total</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-4">
        <Card>
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-bold">Penjualan 7 hari</h3>
            <span className="text-xs text-stone-600">Total harian</span>
          </div>
          <CardBody>
            {dayVals.every(v=>v===0) ? (
              <div className="py-12 text-center text-sm text-stone-600 bg-stone-50 border border-dashed rounded-xl">Belum ada penjualan 7 hari terakhir.</div>
            ) : (
              <div className="h-[180px] flex items-end gap-2">
                {keys.map((k,i)=>{
                  const v = dayVals[i];
                  const h = maxVal ? (v / maxVal) * 140 : 0;
                  const isLast = i===6;
                  const label = new Date(k).toLocaleDateString("id-ID", { day:"2-digit", month:"short" });
                  return (
                    <div key={k} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[11px] font-semibold tabular text-stone-700">{v? rupiah(v).replace("Rp","").trim() : "—"}</span>
                      <div className={`w-full rounded-t-xl transition ${isLast?"bg-terracotta":"bg-stone-200"} ${v===0?"opacity-40":""}`} style={{height: `${Math.max(4, h)}px`}} />
                      <span className="text-[11px] font-medium text-stone-600">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-bold">Antrian dapur</h3>
            <Badge status="pending">{pending} menunggu</Badge>
          </div>
          <div className="divide-y divide-stone-100">
            {activeOrders.length===0 ? (
              <div className="p-8 text-center text-sm text-stone-600">Tidak ada pesanan aktif.</div>
            ) : activeOrders.slice(0,4).map(o=>(
              <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">Meja {o.table_number ?? "?"} · {o.customer_name || "Tanpa nama"}</div>
                  <div className="text-xs text-stone-600 truncate">{(o.items||[]).length} item · {rupiah(o.total)}</div>
                </div>
                <Badge status={o.status}>{o.status==="pending"?"Menunggu":o.status==="cooking"?"Memasak":"Siap"}</Badge>
              </div>
            ))}
          </div>
          {activeOrders.length>4 && <div className="px-4 py-2 text-xs text-center text-stone-600 border-t border-stone-100">+{activeOrders.length-4} tiket lagi di Dapur</div>}
        </Card>
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-bold">Meja</h3>
          <span className="text-xs text-stone-600">{tables.length} meja</span>
        </div>
        <CardBody>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2.5">
            {tables.length===0 ? (
              <div className="col-span-full py-8 text-center text-sm text-stone-600 bg-stone-50 border border-dashed rounded-xl">Memuat meja…</div>
            ) : tables.map(t=>(
              <div key={t.id} className={`rounded-2xl border p-3 text-center ${t.status==="occupied"?"bg-ink text-white border-ink":t.status==="reserved"?"bg-amber-50 border-amber-200":"bg-white"}`}>
                <div className="text-[11px] font-bold tracking-wide opacity-70">MEJA</div>
                <div className="font-display font-bold text-lg leading-none mt-0.5">{t.number}</div>
                <div className="text-[11px] font-bold mt-1">{t.status==="available"?"Kosong":t.status==="occupied"?"Terisi":"Reservasi"}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
