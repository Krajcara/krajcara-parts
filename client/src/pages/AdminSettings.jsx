import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings").then(setSettings);
  }, []);

  async function handleToggleConstruction() {
    const newValue = settings.site_under_construction === "true" ? "false" : "true";
    await api.put("/settings", { site_under_construction: newValue });
    setSettings({ ...settings, site_under_construction: newValue });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isUnderConstruction = settings.site_under_construction === "true";

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-xl font-semibold mb-4">Podešavanja sajta</h2>

      <div className="bg-white border border-line rounded-lg p-5">
        <p className="font-medium mb-1">Traka "Sajt u izradi"</p>
        <p className="text-sm text-ink/60 mb-4">
          Kada je uključena, na vrhu javnog sajta se prikazuje napomena da je sajt u izradi.
          Isključi je kada sajt bude spreman za zvanično lansiranje.
        </p>
        <button
          onClick={handleToggleConstruction}
          className={`px-5 py-2.5 rounded font-medium text-white ${
            isUnderConstruction ? "bg-rust hover:bg-rust/90" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isUnderConstruction ? "Trenutno: UKLJUČENA — isključi" : "Trenutno: ISKLJUČENA — uključi"}
        </button>
        {saved && <p className="text-sm text-emerald-700 mt-2">Sačuvano.</p>}
      </div>
    </div>
  );
}
