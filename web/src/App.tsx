import { BrowserRouter, Routes, Route } from "react-router";

// Layout
import RootLayout from "./layouts/RootLayout";

// Route guards
import GuestRoute from "./routes/GuestRoute";
import AuthRoute from "./routes/AuthRoute";
import CustomerRoute from "./routes/CustomerRoute";
import OrganizerRoute from "./routes/OrganizerRoute";

// Pages
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";
import OrganizerOrdersPage from "./pages/OrganizerOrdersPage";
import VouchersPage from "./pages/VouchersPage";
import CustomerOrdersPage from "./pages/CustomerOrdersPage";
import TicketPage from "./pages/TicketPage";
import WalletPage from "./pages/WalletPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AttendeeListPage from "./pages/AttendeeListPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:slug" element={<EventDetailPage />} />

          {/* Guest only */}
          <Route element={<GuestRoute />}>
            <Route path="auth/login" element={<LoginPage />} />
            <Route path="auth/register" element={<RegisterPage />} />
            <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="auth/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Authenticated */}
          <Route element={<AuthRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="ticket/:orderId" element={<TicketPage />} />

            {/* Customer only */}
            <Route element={<CustomerRoute />}>
              <Route path="customer/orders" element={<CustomerOrdersPage />} />
            </Route>

            {/* Organizer only */}
            <Route element={<OrganizerRoute />}>
              <Route
                path="organizer/dashboard"
                element={<OrganizerDashboardPage />}
              />
              <Route
                path="organizer/event/create"
                element={<CreateEventPage />}
              />
              <Route
                path="organizer/event/edit/:id"
                element={<EditEventPage />}
              />
              <Route
                path="organizer/event/:eventId/vouchers"
                element={<VouchersPage />}
              />
              <Route
                path="organizer/orders"
                element={<OrganizerOrdersPage />}
              />
              <Route
                path="organizer/event/:eventId/attendees"
                element={<AttendeeListPage />}
              />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
