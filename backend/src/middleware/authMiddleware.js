import { supabaseAnon, supabaseAdmin } from "../config/supabase.js";

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, data: null, message: "Token tidak ditemukan" });

    // Mock token untuk demo — izinkan jika ALLOW_MOCK=true (untuk Vercel demo) atau non-production
    if (token.startsWith("mock.jwt.")) {
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK !== "true") {
        return res.status(401).json({ success: false, data: null, message: "Token mock tidak diizinkan di production" });
      }
      const parts = token.split(".");
      const role = parts[2] || "admin";
      if (!["admin","user"].includes(role)) {
        return res.status(401).json({ success: false, data: null, message: "Role tidak valid" });
      }
      const emailMap = { admin: "admin@warungpos.id", user: "user@warungpos.id" };
      req.user = { id: `mock-${role}`, email: emailMap[role] || "demo@warungpos.id", role, profile: null, raw: null };
      req.token = token;
      return next();
    }

    // Verifikasi via Supabase Auth
    const supabase = supabaseAnon;
    if (!supabase) return res.status(500).json({ success: false, data: null, message: "Supabase belum dikonfigurasi" });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ success: false, data: null, message: "Token tidak valid" });

    // Ambil role dari tabel users (service key agar bisa bypass RLS untuk lookup)
    let role = null;
    let profile = null;
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin.from("users").select("id,name,email,role").eq("id", user.id).single();
      profile = data || null;
      role = data?.role || null;
    }
    // fallback: role dari user_metadata jika ada
    if (!role) role = user.user_metadata?.role || "user";

    req.user = { id: user.id, email: user.email, role, profile, raw: user };
    req.token = token;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, data: null, message: e.message });
  }
}
