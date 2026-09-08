import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { query } from "../config/db.js";

const r = Router();
r.use(authMiddleware);

r.get("/", async (req, res) => {
  try {
    const { rows } = await query(`select id, number, status from tables order by number`);
    return res.json({ success: true, data: rows, message: "OK" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

r.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["available","occupied","reserved"].includes(status)) return res.status(400).json({ success: false, data: null, message: "Status meja tidak valid" });
    const { rows: [row] } = await query(`update tables set status=$1 where id=$2 returning *`, [status, req.params.id]);
    if (!row) return res.status(404).json({ success: false, data: null, message: "Meja tidak ditemukan" });
    return res.json({ success: true, data: row, message: "OK" });
  } catch (e) { return res.status(500).json({ success: false, data: null, message: e.message }); }
});

export default r;
