import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";
import { FullPageSpinner } from "./FullPageSpinner.tsx";

export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
