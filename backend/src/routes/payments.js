import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { query } from "../config/db.js";
import { paymentValidators } from "../middleware/validate.js";

const r = Router();
r.use(authMiddleware);

// POST /api/payments — user/admin (user pesan & bayar sendiri)
r.post("/", roleMiddleware(["admin","user"]), paymentValidators, async (req, res) => {
  const client = (await import("../config/db.js")).pool;
  const conn = await client.connect();
  try {
    const { order_id, method, amount } = req.body;
    if (!order_id || !method || amount == null) return res.status(400).json({ success: false, data: null, message: "order_id, method, amount wajib" });
    const allowed = ["cash","qris","debit"];
    if (!allowed.includes(method)) return res.status(400).json({ success: false, data: null, message: "Metode tidak valid" });
    const { rows: [order] } = await conn.query(`select * from orders where id=$1`, [order_id]);
    if (!order) return res.status(404).json({ success: false, data: null, message: "Pesanan tidak ditemukan" });
    if (order.status === "paid") return res.status(400).json({ success: false, data: null, message: "Pesanan sudah dibayar" });
    await conn.query("BEGIN");
    const { rows: [pay] } = await conn.query(
      `insert into payments (order_id, method, amount) values ($1,$2,$3) returning *`,
      [order_id, method, Number(amount)]
    );
    await conn.query(`update orders set status='paid' where id=$1`, [order_id]);
    if (order.table_id) await conn.query(`update tables set status='available' where id=$1`, [order.table_id]);
    await conn.query("COMMIT");
    return res.status(201).json({ success: true, data: pay, message: "Pembayaran berhasil" });
  } catch (e) {
    try { await conn.query("ROLLBACK"); } catch {}
    // unique violation = sudah ada payment untuk order ini
    if (e.code === "23505") return res.status(400).json({ success: false, data: null, message: "Pesanan sudah dibayar" });
    return res.status(500).json({ success: false, data: null, message: e.message });
  } finally { conn.release(); }
});

r.get("/", roleMiddleware(["admin","user"]), async (req, res) => {
  try {
    const { rows } = await query(`select p.*, o.table_id, o.total from payments p join orders o on o.id=p.order_id order by p.paid_at desc limit 50`);
    return res.json({ success: true, data: rows, message: "OK" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

export default r;
