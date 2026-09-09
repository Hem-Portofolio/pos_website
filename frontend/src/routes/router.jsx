import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { AppShell } from "../components/layout/AppShell";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import MenuManager from "../pages/admin/MenuManager";
import Reports from "../pages/admin/Reports";
import POSTerminal from "../pages/kasir/POS";
import TableMap from "../pages/waiter/TableMap";
import KDS from "../pages/kitchen/KDS";

function Guard({ roles, children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/admin", element: <Guard roles={["admin"]}><AdminDashboard /></Guard> },
  { path: "/admin/menu", element: <Guard roles={["admin"]}><MenuManager /></Guard> },
  { path: "/admin/reports", element: <Guard roles={["admin"]}><Reports /></Guard> },
  // ordering — admin & user biasa
  { path: "/pos", element: <Guard roles={["admin","user"]}><POSTerminal /></Guard> },
  { path: "/waiter", element: <Guard roles={["admin","user"]}><TableMap /></Guard> },
  // dapur — hanya admin
  { path: "/kitchen", element: <Guard roles={["admin"]}><KDS /></Guard> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
