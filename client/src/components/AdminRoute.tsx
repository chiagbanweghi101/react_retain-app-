import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";

export function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
