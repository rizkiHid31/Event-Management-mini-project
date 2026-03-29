import { useAuthStore } from "@/store/auth.store";
import { Navigate, Outlet } from "react-router";

export default function GuestRoute() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" />;
  return <Outlet />;
}
