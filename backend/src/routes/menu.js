import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { query } from "../config/db.js";
import { menuValidators } from "../middleware/validate.js";

const r = Router();
r.use(authMiddleware);

r.get("/", async (req, res) => {
  try {
    const { rows } = await query(`
      select m.id, m.name, m.price, m.category_id, m.image_url, m.is_available, c.name as category_name
      from menu_items m left join categories c on c.id=m.category_id order by m.name
    `);
    return res.json({ success: true, data: rows, message: "OK" });
  } catch (e) {
    return res.status(500).json({ success: false, data: null, message: e.message });
  }
});

r.get("/categories", async (req, res) => {
  try {
    const { rows } = await query(`select id, name from categories order by name`);
    return res.json({ success: true, data: rows, message: "OK" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

r.post("/", roleMiddleware(["admin"]), menuValidators.create, async (req, res) => {
  try {
    const { name, price, category_id, is_available = true } = req.body;
    const { rows } = await query(
      `insert into menu_items (name, price, category_id, is_available) values ($1,$2,$3,$4) returning *`,
      [name, Number(price), category_id || null, is_available]
    );
    return res.status(201).json({ success: true, data: rows[0], message: "Menu ditambahkan" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

r.put("/:id", roleMiddleware(["admin"]), menuValidators.update, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category_id, is_available } = req.body;
    const { rows } = await query(
      `update menu_items set name=coalesce($1,name), price=coalesce($2,price), category_id=coalesce($3,category_id), is_available=coalesce($4,is_available) where id=$5 returning *`,
      [name || null, price != null ? Number(price) : null, category_id || null, is_available, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, data: null, message: "Menu tidak ditemukan" });
    return res.json({ success: true, data: rows[0], message: "Menu diperbarui" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

r.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    await query(`delete from menu_items where id=$1`, [req.params.id]);
    return res.json({ success: true, data: null, message: "Menu dihapus" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

export default r;
