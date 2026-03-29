import { useAuthStore } from "@/store/auth.store";
import { Navigate, Outlet } from "react-router";

export default function OrganizerRoute() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/auth/login" />;
  if (user.role !== "ORGANIZER") return <Navigate to="/customer/orders" />;
  return <Outlet />;
}
