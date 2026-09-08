import { useEffect, useState } from "react";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { rupiah } from "../../lib/format";
import { api } from "../../lib/api";
import { categories as fallbackCats, menuItems as fallbackItems } from "../../data/mock";

export default function MenuManager() {
  const [items, setItems] = useState(fallbackItems);
  const [cats, setCats] = useState(fallbackCats);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category_id: fallbackCats[0]?.id || "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await api.get("/api/menu");
      if (res.data?.length) setItems(res.data.map(r=>({ ...r, category_id: r.category_id })));
      const cRes = await api.get("/api/menu/categories").catch(()=>null);
      if (cRes?.data?.length) { setCats(cRes.data); setForm(f=>({ ...f, category_id: cRes.data[0].id })); }
    } catch (e) {
      setErr(e.message + " — menampilkan data mock sementara");
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  const filtered = items.filter(i => {
    if (cat !== "all" && i.category_id !== cat) return false;
    if (q && !i.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  async function toggleAvail(id, cur){
    try {
      await api.put(`/api/menu/${id}`, { is_available: !cur });
      setItems(s=>s.map(x=>x.id===id?{...x,is_available:!cur}:x));
    } catch (e) { alert(e.message); }
  }
  async function add(e){
    e.preventDefault();
    try {
      const res = await api.post("/api/menu", { name: form.name, price: Number(form.price), category_id: form.category_id, is_available: true });
      setItems(s=>[res.data, ...s]);
      setForm({ name:"", price:"", category_id: cats[0]?.id || ""}); setShowAdd(false);
    } catch (e2){ alert(e2.message); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">Kelola menu</h1>
          <p className="text-sm text-stone-600 mt-1">Tambah, edit ketersediaan, dan atur kategori. Data tersimpan di Postgres via <code className="px-1 py-0.5 bg-stone-100 border rounded text-xs">/api/menu</code>.</p>
        </div>
        <Button onClick={()=>setShowAdd(v=>!v)}>{showAdd ? "Tutup" : "+ Tambah menu"}</Button>
      </div>
      {err && <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-3 py-2">{err}</div>}
      {loading && <div className="text-sm text-stone-600">Memuat dari database…</div>}

      {showAdd && (
        <Card className="border-brass/40"><CardBody>
          <form onSubmit={add} className="grid sm:grid-cols-4 gap-3 items-end">
            <Input label="Nama menu" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Contoh: Nasi Uduk" required />
            <Input label="Harga (IDR)" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="25000" required />
            <label className="block"><span className="block text-xs font-semibold tracking-wide text-stone-600 mb-1.5">Kategori</span>
              <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm">
                {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <Button type="submit" size="md">Simpan ke DB</Button>
          </form>
        </CardBody></Card>
      )}

      <Card>
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-stone-100">
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={()=>setCat("all")} className={`px-3.5 h-8 rounded-full text-sm font-medium border ${cat==="all"?"bg-ink text-white border-ink":"bg-white border-stone-200"}`}>Semua</button>
            {cats.map(c=><button key={c.id} onClick={()=>setCat(c.id)} className={`px-3.5 h-8 rounded-full text-sm font-medium border ${cat===c.id?"bg-ink text-white border-ink":"bg-white border-stone-200"}`}>{c.name}</button>)}
          </div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari menu…" className="ml-auto h-9 px-3 rounded-full border border-stone-200 bg-white text-sm w-full sm:w-[220px]" />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-stone-600 bg-stone-100/70">
              <tr><th className="text-left px-4 py-2.5">Menu</th><th className="text-left px-4">Kategori</th><th className="text-right px-4">Harga</th><th className="text-center px-4">Status</th><th className="px-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(it=>{
                const cname=cats.find(c=>c.id===it.category_id)?.name || it.category_name || "-";
                return (
                  <tr key={it.id} className="hover:bg-stone-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-lg bg-stone-100 border border-stone-200 grid place-items-center text-xs font-bold text-stone-600">{it.name.charAt(0).toUpperCase()}</span>
                        <span className="font-medium">{it.name}</span>
                      </div>
                    </td>
                    <td className="px-4 text-stone-600">{cname}</td>
                    <td className="px-4 text-right tabular font-semibold">{rupiah(it.price)}</td>
                    <td className="px-4 text-center"><Badge status={it.is_available?"available":"occupied"}>{it.is_available?"Tersedia":"Habis"}</Badge></td>
                    <td className="px-4 text-right"><button onClick={()=>toggleAvail(it.id, it.is_available)} className="text-xs font-semibold px-2.5 py-1.5 rounded-full border bg-white border-stone-200 hover:border-brass">{it.is_available?"Set habis":"Set tersedia"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0 && <div className="p-10 text-center text-sm text-stone-600">Tidak ada menu yang cocok.</div>}
        </div>
      </Card>
    </div>
  );
}
