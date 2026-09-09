import { supabaseAnon } from "../config/supabase.js";

export async function me(req, res) {
  return res.json({ success: true, data: req.user, message: "OK" });
}

// Opsional: proxy register/login lewat backend (alternatif: frontend langsung ke Supabase Auth)
export async function register(req, res) {
  try {
    const { name, email, password, role = "user" } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, data: null, message: "Email & password wajib" });
    const { data, error } = await supabaseAnon.auth.signUp({ email, password, options: { data: { name, role } } });
    if (error) return res.status(400).json({ success: false, data: null, message: error.message });
    return res.status(201).json({ success: true, data, message: "Registrasi berhasil, cek email" });
  } catch (e) {
    return res.status(500).json({ success: false, data: null, message: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ success: false, data: null, message: error.message });
    return res.json({ success: true, data, message: "Login berhasil" });
  } catch (e) {
    return res.status(500).json({ success: false, data: null, message: e.message });
  }
}
