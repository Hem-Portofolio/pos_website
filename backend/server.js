import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import menuRoutes from "./src/routes/menu.js";
import orderRoutes from "./src/routes/orders.js";
import tableRoutes from "./src/routes/tables.js";
import paymentRoutes from "./src/routes/payments.js";
import { auditLog } from "./src/middleware/auditLog.js";

dotenv.config();
const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS whitelist
const allowed = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000").split(",").map(s=>s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if(!origin) return cb(null, true);
    if(allowed.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(auditLog);

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success:false, data:null, message:"Terlalu banyak percobaan, coba lagi 15 menit" } });
const payLimiter = rateLimit({ windowMs: 60*1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success:false, data:null, message:"Terlalu banyak pembayaran, coba lagi" } });

app.get("/health", (req, res) => res.json({ success: true, data: { up: true }, message: "OK" }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/payments", payLimiter, paymentRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, data: null, message: "Not found" }));
// error handler — jangan bocorkan stack di production
app.use((err, req, res, _next) => {
  console.error("[error]", err.message);
  const isProd = process.env.NODE_ENV === "production";
  if(err.message && err.message.includes("CORS blocked")){
    return res.status(403).json({ success:false, data:null, message:"Origin tidak diizinkan" });
  }
  res.status(err.status || 500).json({ success: false, data: null, message: isProd ? "Terjadi kesalahan" : (err.message || "Internal error") });
});

export default app;

if (process.env.VERCEL !== "1") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Warung POS API jalan di http://localhost:${port}`));
}
