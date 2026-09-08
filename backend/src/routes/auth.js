import { Router } from "express";
import { me, register, login } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = Router();
r.post("/register", register);
r.post("/login", login);
r.get("/me", authMiddleware, me);
export default r;
