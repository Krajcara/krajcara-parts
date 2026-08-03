import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../api";
import ThemeToggle from "../components/ThemeToggle";
import AdminParts from "./AdminParts";
import AdminVehicles from "./AdminVehicles";
import AdminCategories from "./AdminCategories";
import AdminEarnings from "./AdminEarnings";
import AdminSettings from "./AdminSettings";

const tabs = [
  { key: "parts", label: "Delovi", Component: AdminParts },
  { key: "vehicles", label: "Vozila", Component: AdminVehicles },
  { key: "categories", label: "Kategorije", Component: AdminCategories },
  { key: "earnings", label: "Zarada", Component: AdminEarnings },
  { key: "settings", label: "Podešavanja", Component: AdminSettings },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("parts");
  const navigate = useNavigate();
  const ActiveComponent = tabs.find((t) => t.key === active).Component;

  function handleLogout() {
    clearToken();
    navigate("/admin/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Admin panel</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle className="border border-line text-ink hover:bg-canvas" />
          <button onClick={handleLogout} className="text-sm text-ink/60 hover:underline">
            Odjavi se
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-line mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === t.key ? "border-rust text-ink" : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
}
