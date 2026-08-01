import { useEffect, useState } from "react";
import { api } from "../api";
import PartCard from "../components/PartCard";

export default function Home() {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  useEffect(() => {
    api.get("/categories").then(setCategories).catch(() => {});
    api.get("/vehicles/makes").then(setMakes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!make) {
      setModels([]);
      setModel("");
      return;
    }
    api.get(`/vehicles/models?make=${encodeURIComponent(make)}`).then(setModels);
  }, [make]);

  useEffect(() => {
    if (!make || !model) {
      setVehicles([]);
      setVehicleId("");
      return;
    }
    api
      .get(`/vehicles?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
      .then(setVehicles);
  }, [make, model]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("category_id", categoryId);
    if (status) params.set("status", status);
    if (vehicleId) params.set("vehicle_id", vehicleId);

    api
      .get(`/parts?${params.toString()}`)
      .then(setParts)
      .finally(() => setLoading(false));
  }, [query, categoryId, status, vehicleId]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold">
          Polovni auto delovi Kikinda
        </h1>
        <p className="text-ink/60 mt-1">
          Autoelektričar sa dugogodišnjim iskustvom — polovni, reparirani i novi delovi za vaše vozilo.
        </p>
      </div>

      {/* Pretraga */}
      <div className="bg-white border border-line rounded-lg p-6 mb-10">
        <h2 className="font-display text-xl font-semibold mb-4">Pronađite deo</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Marka</label>
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full border border-line rounded px-3 py-2"
            >
              <option value="">Sve marke</option>
              {makes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
              className="w-full border border-line rounded px-3 py-2 disabled:bg-canvas"
            >
              <option value="">Svi modeli</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Generacija / motor</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={!model}
              className="w-full border border-line rounded px-3 py-2 disabled:bg-canvas"
            >
              <option value="">Sve varijante</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.generation || ""} {v.year_from ? `(${v.year_from}-${v.year_to || ""})` : ""} {v.engine || ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Naziv ili broj dela (OEM / interni)</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="npr. alternator ili 03G141025"
              className="w-full border border-line rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Kategorija</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-line rounded px-3 py-2"
            >
              <option value="">Sve kategorije</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-line rounded px-3 py-2"
            >
              <option value="">Svi statusi</option>
              <option value="novo">Novo</option>
              <option value="polovno">Polovno</option>
              <option value="reparirano">Reparirano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rezultati */}
      {loading ? (
        <p className="text-ink/50">Učitavanje...</p>
      ) : parts.length === 0 ? (
        <p className="text-ink/50">Nema pronađenih delova za zadate kriterijume.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {parts.map((p) => (
            <PartCard key={p.id} part={p} />
          ))}
        </div>
      )}
    </div>
  );
}
