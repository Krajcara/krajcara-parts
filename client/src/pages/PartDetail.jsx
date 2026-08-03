import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";

const statusLabels = {
  novo: "Novo",
  polovno: "Polovno",
  reparirano: "Reparirano",
};

export default function PartDetail() {
  const { slug } = useParams();
  const [part, setPart] = useState(null);
  const [error, setError] = useState(null);
  const { isInCart, toggleCart } = useCart();

  useEffect(() => {
    api.get(`/parts/${slug}`).then(setPart).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="max-w-3xl mx-auto px-6 py-10 text-red-600 dark:text-red-400">{error}</p>;
  if (!part) return <p className="max-w-3xl mx-auto px-6 py-10 text-ink/50">Učitavanje...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-steel hover:underline">&larr; Nazad na pretragu</Link>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="bg-surface border border-line rounded-lg overflow-hidden aspect-[4/3]">
          {part.image_path ? (
            <img src={part.image_path} alt={part.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30">Nema slike</div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold">{part.name}</h1>
          <p className="text-ink/50 mt-1">Šifra: {part.internal_code}</p>

          <div className="mt-4 space-y-2 text-sm">
            <p><span className="text-ink/50">Status:</span> {statusLabels[part.status]}</p>
            {part.oem_number && <p><span className="text-ink/50">OEM broj:</span> {part.oem_number}</p>}
            {part.brand && <p><span className="text-ink/50">Proizvođač:</span> {part.brand}</p>}
            {part.status === "reparirano" && part.repair_notes && (
              <p><span className="text-ink/50">Šta je reparirano:</span> {part.repair_notes}</p>
            )}
            {part.price != null && (
              <p className="text-xl font-semibold text-steel mt-2">{part.price} {part.currency || "RSD"}</p>
            )}
          </div>

          {part.description && (
            <p className="mt-4 text-ink/80 leading-relaxed">{part.description}</p>
          )}

          {part.vehicles?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Odgovara za:</h3>
              <ul className="text-sm text-ink/70 space-y-1">
                {part.vehicles.map((v) => (
                  <li key={v.id}>
                    {v.make} {v.model} {v.generation} {v.year_from ? `(${v.year_from}-${v.year_to || ""})` : ""} {v.engine}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => toggleCart(part)}
            className={`mt-8 inline-flex items-center justify-center gap-2 transition-colors font-medium px-6 py-3 rounded w-full md:w-auto ${
              isInCart(part.id)
                ? "bg-surface border border-line text-ink hover:bg-canvas"
                : "bg-rust hover:bg-rust/90 text-white"
            }`}
          >
            {isInCart(part.id) ? "Ukloni iz korpe" : "Dodaj u korpu"}
          </button>
        </div>
      </div>
    </div>
  );
}
