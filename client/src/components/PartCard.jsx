import { Link } from "react-router-dom";

const statusLabels = {
  novo: "Novo",
  polovno: "Polovno",
  reparirano: "Reparirano",
};

const statusStyles = {
  novo: "bg-emerald-100 text-emerald-800",
  polovno: "bg-amber-100 text-amber-800",
  reparirano: "bg-steel/15 text-steel",
};

export default function PartCard({ part }) {
  return (
    <Link
      to={`/delovi/${part.id}`}
      className="group bg-white border border-line rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="aspect-[4/3] bg-canvas overflow-hidden">
        {part.image_path ? (
          <img
            src={part.image_path}
            alt={part.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
            Nema slike
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-medium text-lg leading-tight">{part.name}</h3>
          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusStyles[part.status]}`}>
            {statusLabels[part.status]}
          </span>
        </div>
        {part.oem_number && (
          <p className="text-sm text-ink/60">OEM: {part.oem_number}</p>
        )}
        <p className="text-xs text-ink/50">Šifra: {part.internal_code}</p>
        {part.price != null && (
          <p className="mt-auto font-semibold text-steel">{part.price} {part.currency || "RSD"}</p>
        )}
      </div>
    </Link>
  );
}
