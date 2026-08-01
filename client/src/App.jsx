import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getToken } from "./api";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import Header from "./components/Header";
import UnderConstructionBanner from "./components/UnderConstructionBanner";
import Home from "./pages/Home";
import PartDetail from "./pages/PartDetail";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppShell() {
  const { settings } = useSettings();
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {settings.site_under_construction === "true" && !isAdminRoute && <UnderConstructionBanner />}
      {!isAdminRoute && <Header />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/delovi/:id" element={<PartDetail />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && (
        <footer className="bg-graphite text-white/60 text-sm text-center py-6 mt-10">
          © {new Date().getFullYear()} Krajcara — Novi Sad
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
}
