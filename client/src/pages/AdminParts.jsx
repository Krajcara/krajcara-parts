import { useEffect, useState } from "react";
import { api } from "../api";

const emptyForm = {
  name: "", category_id: "", oem_number: "", brand_code: "", brand: "",
  status: "polovno", repair_notes: "", description: "", price: "",
  quantity: 1, availability_status: "aktivno", vehicle_ids: [],
};

export default function AdminParts() {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function loadParts() {
    api.get("/parts/admin").then(setParts).catch((e) => setError(e.message));
  }

  useEffect(() => {
    loadParts();
    api.get("/categories").then(setCategories);
    api.get("/vehicles").then(setVehicles);
  }, []);

  function startEdit(part) {
    setEditingId(part.id);
    setForm({
      name: part.name || "",
      category_id: part.category_id || "",
      oem_number: part.oem_number || "",
      brand_code: part.brand_code || "",
      brand: part.brand || "",
      status: part.status,
      repair_notes: part.repair_notes || "",
      description: part.description || "",
      price: part.price ?? "",
      quantity: part.quantity ?? 1,
      availability_status: part.availability_status,
      vehicle_ids: part.vehicles?.map((v) => v.id) || [],
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "vehicle_ids") {
          fd.append(key, JSON.stringify(value));
        } else {
          fd.append(key, value);
        }
      });
      if (imageFile) fd.append("image", imageFile);

      if (editingId) {
        await api.put(`/parts/${editingId}`, fd);
      } else {
        await api.post("/parts", fd);
      }
      resetForm();
      loadParts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Obrisati ovaj deo?")) return;
    await api.delete(`/parts/${id}`);
    loadParts();
  }

  function toggleVehicle(vId) {
    setForm((f) => ({
      ...f,
      vehicle_ids: f.vehicle_ids.includes(vId)
        ? f.vehicle_ids.filter((id) => id !== vId)
        : [...f.vehicle_ids, vId],
    }));
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">
          {editingId ? "Izmena dela" : "Dodavanje novog dela"}
        </h2>
        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Naziv *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-line rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Kategorija</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-line rounded px-3 py-2">
                <option value="">-</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Status *</label>
              <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-line rounded px-3 py-2">
                <option value="novo">Novo</option>
                <option value="polovno">Polovno</option>
                <option value="reparirano">Reparirano</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">OEM broj</label>
              <input value={form.oem_number} onChange={(e) => setForm({ ...form, oem_number: e.target.value })}
                className="w-full border border-line rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Brend kod</label>
              <input value={form.brand_code} onChange={(e) => setForm({ ...form, brand_code: e.target.value })}
                className="w-full border border-line rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Proizvođač / brend</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full border border-line rounded px-3 py-2" />
          </div>

          {form.status === "reparirano" && (
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Šta je reparirano</label>
              <textarea value={form.repair_notes} onChange={(e) => setForm({ ...form, repair_notes: e.target.value })}
                className="w-full border border-line rounded px-3 py-2" rows={2} />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Opis</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-line rounded px-3 py-2" rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Cena (RSD)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-line rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Količina</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-line rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Dostupnost</label>
              <select value={form.availability_status} onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
                className="w-full border border-line rounded px-3 py-2">
                <option value="aktivno">Aktivno</option>
                <option value="rezervisano">Rezervisano</option>
                <option value="prodato">Prodato</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Slika (biće automatski smanjena)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Kompatibilna vozila</label>
            <div className="max-h-32 overflow-y-auto border border-line rounded px-3 py-2 space-y-1">
              {vehicles.length === 0 && <p className="text-xs text-ink/40">Nema unetih vozila.</p>}
              {vehicles.map((v) => (
                <label key={v.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.vehicle_ids.includes(v.id)} onChange={() => toggleVehicle(v.id)} />
                  {v.make} {v.model} {v.generation}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-graphite hover:bg-graphite/90 text-white font-medium px-5 py-2.5 rounded disabled:opacity-50">
              {saving ? "Čuvanje..." : editingId ? "Sačuvaj izmene" : "Dodaj deo"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded border border-line">
                Otkaži
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Svi delovi ({parts.length})</h2>
        <div className="space-y-2 max-h-[800px] overflow-y-auto pr-1">
          {parts.map((p) => (
            <div key={p.id} className="bg-white border border-line rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-ink/50">{p.internal_code} · {p.status} · {p.availability_status}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className="text-sm text-steel hover:underline">Izmeni</button>
                <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 hover:underline">Obriši</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
