import { useEffect, useState } from "react";
import { api } from "../api";

const emptyForm = { make: "", model: "", generation: "", year_from: "", year_to: "", engine: "" };

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  function load() {
    api.get("/vehicles").then(setVehicles);
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/vehicles", form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Obrisati ovo vozilo?")) return;
    await api.delete(`/vehicles/${id}`);
    load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Dodaj vozilo</h2>
        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Marka *" value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              className="border border-line rounded px-3 py-2" />
            <input required placeholder="Model *" value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="border border-line rounded px-3 py-2" />
          </div>
          <input placeholder="Generacija (npr. Golf 5)" value={form.generation}
            onChange={(e) => setForm({ ...form, generation: e.target.value })}
            className="w-full border border-line rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Godina od" value={form.year_from}
              onChange={(e) => setForm({ ...form, year_from: e.target.value })}
              className="border border-line rounded px-3 py-2" />
            <input type="number" placeholder="Godina do" value={form.year_to}
              onChange={(e) => setForm({ ...form, year_to: e.target.value })}
              className="border border-line rounded px-3 py-2" />
          </div>
          <input placeholder="Motor (npr. 1.9 TDI 105ks)" value={form.engine}
            onChange={(e) => setForm({ ...form, engine: e.target.value })}
            className="w-full border border-line rounded px-3 py-2" />

          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

          <button type="submit" className="bg-graphite hover:bg-graphite/90 text-white font-medium px-5 py-2.5 rounded">
            Dodaj vozilo
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Sva vozila ({vehicles.length})</h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-surface border border-line rounded-lg p-3 flex items-center justify-between gap-3">
              <p className="text-sm">
                {v.make} {v.model} {v.generation} {v.year_from ? `(${v.year_from}-${v.year_to || ""})` : ""} {v.engine}
              </p>
              <button onClick={() => handleDelete(v.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline shrink-0">
                Obriši
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
