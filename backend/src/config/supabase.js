import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_KEY;

if (!url) console.warn("[supabase] SUPABASE_URL belum diisi — isi .env");

export const supabaseAnon = url && anon ? createClient(url, anon) : null;
export const supabaseAdmin = url && service ? createClient(url, service) : null;
