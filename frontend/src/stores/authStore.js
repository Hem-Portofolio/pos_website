import { create } from "zustand";
import { demoUsers } from "../data/mock";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("wp_user") || "null"),
  token: localStorage.getItem("token") || null,
  login: async (email, password) => {
    // mock auth — cocok untuk demo tanpa Supabase live
    const found = demoUsers.find((u) => u.email === email && u.pass === password);
    if (!found) throw new Error("Email atau kata sandi salah");
    const user = { id: "u-" + found.role, name: found.name, email: found.email, role: found.role };
    const token = "mock.jwt." + found.role + "." + Date.now();
    localStorage.setItem("token", token);
    localStorage.setItem("wp_user", JSON.stringify(user));
    set({ user, token });
    return user;
  },
  loginAs: (role) => {
    const found = demoUsers.find((u) => u.role === role);
    return get().login(found.email, found.pass);
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("wp_user");
    set({ user: null, token: null });
  },
}));
