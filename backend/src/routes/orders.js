import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { query } from "../config/db.js";
import { orderValidators } from "../middleware/validate.js";

const r = Router();
r.use(authMiddleware);

// GET /api/orders — list orders with items
r.get("/", async (req, res) => {
  try {
    const { rows: orders } = await query(`
      select o.id, o.table_id, o.waiter_id, o.status, o.total, o.created_at, o.customer_name, t.number as table_number
      from orders o left join tables t on t.id=o.table_id
      order by o.created_at desc limit 50
    `);
    // fetch items for each order
    for (const o of orders) {
      const { rows: items } = await query(
        `select oi.menu_item_id, oi.qty, oi.note, oi.subtotal, m.name as menu_name, m.price
         from order_items oi left join menu_items m on m.id=oi.menu_item_id where oi.order_id=$1`, [o.id]
      );
      o.items = items;
    }
    return res.json({ success: true, data: orders, message: "OK" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

// POST /api/orders — buat pesanan (user/admin)
r.post("/", orderValidators.create, async (req, res) => {
  const client = (await import("../config/db.js")).pool;
  const conn = await client.connect();
  try {
    const { table_id, items, customer_name } = req.body;
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, data: null, message: "Nama pelanggan wajib diisi" });
    }
    if (!table_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, data: null, message: "table_id dan items wajib" });
    }
    // hitung total dari DB price agar tidak manipulasi
    let total = 0;
    const enriched = [];
    for (const it of items) {
      const { rows } = await conn.query(`select price, name from menu_items where id=$1`, [it.menu_item_id]);
      if (!rows[0]) throw new Error(`Menu ${it.menu_item_id} tidak ditemukan`);
      const price = rows[0].price;
      const qty = Number(it.qty) || 1;
      const subtotal = price * qty;
      total += subtotal;
      enriched.push({ menu_item_id: it.menu_item_id, qty, note: it.note || null, subtotal });
    }
    const waiterId = req.user.id.startsWith("mock-") ? null : req.user.id;
    await conn.query("BEGIN");
    const { rows: [order] } = await conn.query(
      `insert into orders (table_id, waiter_id, status, total, customer_name) values ($1,$2,'pending',$3,$4) returning *`,
      [table_id, waiterId, total, customer_name.trim()]
    );
    for (const it of enriched) {
      await conn.query(
        `insert into order_items (order_id, menu_item_id, qty, note, subtotal) values ($1,$2,$3,$4,$5)`,
        [order.id, it.menu_item_id, it.qty, it.note, it.subtotal]
      );
    }
    // tandai meja occupied
    await conn.query(`update tables set status='occupied' where id=$1`, [table_id]);
    await conn.query("COMMIT");
    return res.status(201).json({ success: true, data: { ...order, items: enriched }, message: "Pesanan dibuat" });
  } catch (e) {
    try { await conn.query("ROLLBACK"); } catch {}
    return res.status(500).json({ success: false, data: null, message: e.message });
  } finally { conn.release(); }
});

// PATCH / PUT /api/orders/:id/status — admin (dapur) update status
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["pending","cooking","ready","cancelled"];
    // paid hanya via /api/payments, tidak via status langsung — cegah selesaikan tanpa bayar
    if (status === "paid") {
      return res.status(400).json({ success: false, data: null, message: "Gunakan pembayaran untuk menyelesaikan pesanan" });
    }
    if (!allowed.includes(status)) return res.status(400).json({ success: false, data: null, message: "Status tidak valid" });
    const { rows: [order] } = await query(`update orders set status=$1 where id=$2 returning *`, [status, req.params.id]);
    if (!order) return res.status(404).json({ success: false, data: null, message: "Pesanan tidak ditemukan" });
    if (status === "cancelled") {
      if (order.table_id) await query(`update tables set status='available' where id=$1`, [order.table_id]);
    }
    return res.json({ success: true, data: order, message: "Status diperbarui" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
}
r.patch("/:id/status", orderValidators.status, updateStatus);
r.put("/:id/status", orderValidators.status, updateStatus);

export default r;
