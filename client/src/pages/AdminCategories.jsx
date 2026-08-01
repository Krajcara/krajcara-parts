import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  function load() {
    api.get("/categories").then(setCategories);
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/categories", { name });
      setName("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Obrisati ovu kategoriju?")) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-xl font-semibold mb-4">Kategorije</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naziv nove kategorije"
          className="flex-1 border border-line rounded px-3 py-2"
        />
        <button type="submit" className="bg-graphite hover:bg-graphite/90 text-white font-medium px-4 py-2 rounded">
          Dodaj
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="bg-white border border-line rounded-lg p-3 flex items-center justify-between">
            <span>{c.name}</span>
            <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:underline">
              Obriši
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
