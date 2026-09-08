import { useEffect, useState } from "react";
import { Card, CardBody } from "../../components/ui/Card";
import { rupiah } from "../../lib/format";
import { api } from "../../lib/api";

function toDateKey(iso){ return new Date(iso).toISOString().slice(0,10); }
function fmtID(dateStr){
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });
}

export default function Reports(){
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(){
    setLoading(true);
    try{
      const [pRes, oRes] = await Promise.all([
        api.get("/api/payments").catch(()=>({data:[]})),
        api.get("/api/orders").catch(()=>({data:[]})),
      ]);
      setPayments(pRes.data||[]);
      setOrders(oRes.data||[]);
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  // agregasi per tanggal dari payments
  const byDay = {};
  payments.forEach(p=>{
    const k = toDateKey(p.paid_at || p.created_at || new Date().toISOString());
    if(!byDay[k]) byDay[k] = { penjualan:0, count:0 };
    byDay[k].penjualan += Number(p.amount||0);
    byDay[k].count += 1;
  });
  // gabung tanggal dari orders yang belum dibayar? untuk laporan, hitung dari payments saja
  const rows = Object.entries(byDay)
    .sort((a,b)=> b[0].localeCompare(a[0]))
    .slice(0,7)
    .map(([k,v])=>({ tgl: fmtID(k), key:k, pesanan: v.count, penjualan: v.penjualan, rata: v.count? Math.round(v.penjualan / v.count):0 }));

  const todayKey = new Date().toISOString().slice(0,10);
  const today = byDay[todayKey] || { penjualan:0, count:0 };
  const weekTotal = Object.values(byDay).reduce((a,b)=>a+b.penjualan,0);
  const weekCount = Object.values(byDay).reduce((a,b)=>a+b.count,0);
  const avg = weekCount ? Math.round(weekTotal / weekCount) : 0;

  if(loading) return <div className="py-16 text-center text-sm text-stone-600">Memuat laporan…</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight leading-none">Laporan</h1>
          <p className="text-sm text-stone-600 mt-1.5">Rekap dari <code className="px-1 py-0.5 bg-stone-100 border rounded text-xs">payments</code> & <code className="px-1 py-0.5 bg-stone-100 border rounded text-xs">orders</code> — live.</p>
        </div>
        <button onClick={load} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:bg-stone-50">Muat ulang</button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="border-terracotta/20"><CardBody className="py-4"><div className="text-xs font-bold tracking-wide uppercase text-stone-600">Hari ini</div><div className="font-display font-extrabold text-xl mt-1 tabular text-terracotta">{rupiah(today.penjualan)}</div><div className="text-xs text-stone-600 mt-1">{today.count} transaksi</div></CardBody></Card>
        <Card><CardBody className="py-4"><div className="text-xs font-bold tracking-wide uppercase text-stone-600">7 hari</div><div className="font-display font-bold text-xl mt-1 tabular">{rupiah(weekTotal)}</div><div className="text-xs text-stone-600 mt-1">{weekCount} transaksi</div></CardBody></Card>
        <Card><CardBody className="py-4"><div className="text-xs font-bold tracking-wide uppercase text-stone-600">Rata-rata</div><div className="font-display font-bold text-xl mt-1 tabular">{rupiah(avg)}</div><div className="text-xs text-stone-600 mt-1">per transaksi</div></CardBody></Card>
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold">Rincian harian</h3>
          <span className="text-xs text-stone-600">Tunai · QRIS · Debit</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs font-bold tracking-wide uppercase text-stone-600 bg-stone-50"><tr><th className="text-left px-4 py-2.5">Tanggal</th><th className="text-right px-4">Pesanan</th><th className="text-right px-4">Penjualan</th><th className="text-right px-4">Rata-rata</th></tr></thead>
            <tbody className="divide-y divide-stone-100">
              {rows.length===0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-stone-600">Belum ada transaksi. Buat pesanan dan selesaikan pembayaran untuk melihat laporan.</td></tr>
              ) : rows.map(r=>(
                <tr key={r.key} className="hover:bg-stone-50/60"><td className="px-4 py-3 font-medium">{r.tgl}</td><td className="px-4 text-right tabular">{r.pesanan}</td><td className="px-4 text-right tabular font-bold">{rupiah(r.penjualan)}</td><td className="px-4 text-right tabular text-stone-600">{rupiah(r.rata)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-3 border-b border-stone-100">
          <h3 className="text-sm font-bold">Transaksi terbaru</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {payments.length===0 ? (
            <div className="p-8 text-center text-sm text-stone-600">Belum ada pembayaran.</div>
          ) : payments.slice(0,8).map(p=>(
            <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Order {String(p.order_id).slice(0,6)} · <span className="uppercase text-xs font-bold tracking-wide">{p.method}</span></div>
                <div className="text-xs text-stone-600">{p.paid_at ? new Date(p.paid_at).toLocaleString("id-ID") : ""}</div>
              </div>
              <div className="text-sm font-bold tabular shrink-0">{rupiah(p.amount)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-stone-50 border-stone-200">
        <CardBody className="text-xs leading-relaxed text-stone-600">
          Data diambil live via <code className="px-1.5 py-0.5 bg-white border rounded">GET /api/payments</code> & <code className="px-1.5 py-0.5 bg-white border rounded">GET /api/orders</code>. Untuk filter tanggal/method, tambahkan query di backend (<code className="px-1 py-0.5 bg-white border rounded">/api/reports?from=&to=</code> sudah disiapkan untuk agregasi Postgres bila volume besar).
        </CardBody>
      </Card>
    </div>
  );
}
