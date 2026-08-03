import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminEarnings() {
  const [data, setData] = useState({ totals: { RSD: { count: 0, total: 0 }, EUR: { count: 0, total: 0 } }, items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/parts/stats/earnings")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink/50">Učitavanje...</p>;

  const { totals, items } = data;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Zarada od prodatih delova</h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-line rounded-lg p-5">
          <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">Prodato u RSD</p>
          <p className="text-3xl font-display font-semibold text-steel">
            {totals.RSD.total.toLocaleString("sr-RS")} RSD
          </p>
          <p className="text-sm text-ink/60 mt-1">{totals.RSD.count} {totals.RSD.count === 1 ? "deo" : "dela"}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-5">
          <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">Prodato u EUR</p>
          <p className="text-3xl font-display font-semibold text-steel">
            {totals.EUR.total.toLocaleString("sr-RS")} EUR
          </p>
          <p className="text-sm text-ink/60 mt-1">{totals.EUR.count} {totals.EUR.count === 1 ? "deo" : "dela"}</p>
        </div>
      </div>

      <h3 className="font-medium mb-3">Spisak prodatih delova ({items.length})</h3>

      {items.length === 0 ? (
        <p className="text-ink/50 text-sm">Još nema prodatih delova.</p>
      ) : (
        <div className="bg-surface border border-line rounded-lg divide-y divide-line max-h-[600px] overflow-y-auto">
          {items.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-ink/50">
                  {p.internal_code} {p.category_name ? `· ${p.category_name}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium text-steel">{p.price} {p.currency || "RSD"}</p>
                <p className="text-xs text-ink/50">
                  {new Date(p.updated_at).toLocaleDateString("sr-RS")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-ink/40 mt-4">
        Napomena: podaci se računaju u realnom vremenu na osnovu delova sa statusom "Prodato" —
        ako obrišeš deo, automatski se uklanja i iz ove statistike.
      </p>
    </div>
  );
}
