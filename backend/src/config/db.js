import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const conn = process.env.DATABASE_URL || process.env.DIRECT_URL;
let pool = null;
if (conn) {
  pool = new pg.Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  pool.on("error", (e) => console.error("[pg pool]", e.message));
} else {
  console.warn("[db] DATABASE_URL belum diisi — DB via pg tidak aktif");
}
export { pool };
export async function query(text, params) {
  if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");
  return pool.query(text, params);
}
