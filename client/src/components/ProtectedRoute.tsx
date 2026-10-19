import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";
import { FullPageSpinner } from "./FullPageSpinner.tsx";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/signin" replace />;
  return <Outlet />;
}
