import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedContact, setSavedContact] = useState(false);

  useEffect(() => {
    api.get("/settings").then((data) => {
      setSettings(data);
      setPhone(data.contact_phone || "");
      setPhone2(data.contact_phone2 || "");
    });
  }, []);

  async function handleToggleConstruction() {
    const newValue = settings.site_under_construction === "true" ? "false" : "true";
    await api.put("/settings", { site_under_construction: newValue });
    setSettings({ ...settings, site_under_construction: newValue });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSaveContact(e) {
    e.preventDefault();
    await api.put("/settings", { contact_phone: phone, contact_phone2: phone2 });
    setSettings({ ...settings, contact_phone: phone, contact_phone2: phone2 });
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 2000);
  }

  const isUnderConstruction = settings.site_under_construction === "true";

  return (
    <div className="max-w-lg space-y-8">
      <div>
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

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Kontakt podaci</h2>
        <p className="text-sm text-ink/60 mb-4">
          Prikazuju se na javnoj Kontakt stranici i u Korpi. Drugi telefon je opcion — ako ga ostaviš
          praznim, na sajtu se prikazuje samo prvi.
        </p>
        <form onSubmit={handleSaveContact} className="bg-white border border-line rounded-lg p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Telefon</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="npr. 060 000 0000"
              className="w-full border border-line rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Telefon 2 (opciono)</label>
            <input
              type="text"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              placeholder="npr. 063 000 0000"
              className="w-full border border-line rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="bg-graphite hover:bg-graphite/90 text-white font-medium px-5 py-2.5 rounded"
          >
            Sačuvaj kontakt podatke
          </button>
          {savedContact && <p className="text-sm text-emerald-700">Sačuvano.</p>}
        </form>
      </div>
    </div>
  );
}
