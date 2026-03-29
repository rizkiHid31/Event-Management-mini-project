import { useAuthStore } from "@/store/auth.store";
import { Navigate, Outlet } from "react-router";

export default function AuthRoute() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  return <Outlet />;
}
