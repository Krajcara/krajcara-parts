import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";

export default function Cart() {
  const { items, removeFromCart } = useCart();
  const { settings } = useSettings();
  const phone = settings.contact_phone;
  const email = settings.contact_email;

  const mailBody = items
    .map((p) => `- ${p.name} (šifra: ${p.internal_code})`)
    .join("\n");
  const mailtoLink = email
    ? `mailto:${email}?subject=${encodeURIComponent("Upit za delove - Krajcara.com")}&body=${encodeURIComponent(
        `Zdravo,\n\nZanimaju me sledeći delovi:\n\n${mailBody}\n\nHvala!`
      )}`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-2">Korpa</h1>
      <p className="text-ink/60 mb-8">
        Ovo nije online porudžbina — samo spisak delova koje želite da pitate telefonom ili mejlom.
      </p>

      {items.length === 0 ? (
        <div className="bg-white border border-line rounded-lg p-8 text-center">
          <p className="text-ink/50 mb-4">Korpa je prazna.</p>
          <Link to="/" className="text-steel hover:underline text-sm">
            &larr; Nazad na pretragu delova
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-line rounded-lg divide-y divide-line mb-6 print:hidden">
            {items.map((part) => (
              <div key={part.id} className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-canvas rounded overflow-hidden shrink-0">
                  {part.image_path ? (
                    <img src={part.image_path} alt={part.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">
                      Nema slike
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/delovi/${part.id}`} className="font-medium hover:text-steel truncate block">
                    {part.name}
                  </Link>
                  <p className="text-xs text-ink/50">Šifra: {part.internal_code}</p>
                  {part.price != null && (
                    <p className="text-sm text-steel font-medium">{part.price} {part.currency || "RSD"}</p>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(part.id)}
                  className="text-sm text-red-600 hover:underline shrink-0 print:hidden"
                >
                  Ukloni
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-line rounded-lg p-5 print:hidden">
            <h2 className="font-medium mb-4">Pošaljite upit za ove delove</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {mailtoLink ? (
                <a
                  href={mailtoLink}
                  className="flex-1 text-center bg-graphite hover:bg-graphite/90 transition-colors text-white font-medium px-5 py-3 rounded"
                >
                  Pošalji upit mejlom
                </a>
              ) : (
                <p className="flex-1 text-sm text-ink/40 italic self-center">E-mail još nije podešen.</p>
              )}
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex-1 text-center bg-rust hover:bg-rust/90 transition-colors text-white font-medium px-5 py-3 rounded leading-tight"
                >
                  <span className="block">Pozovite nas</span>
                  <span className="block text-sm font-normal opacity-90">{phone}</span>
                </a>
              ) : (
                <Link
                  to="/kontakt"
                  className="flex-1 text-center bg-rust hover:bg-rust/90 transition-colors text-white font-medium px-5 py-3 rounded"
                >
                  Kontakt podaci
                </Link>
              )}
              <button
                onClick={() => window.print()}
                className="flex-1 text-center bg-white border border-line hover:bg-canvas transition-colors text-ink font-medium px-5 py-3 rounded"
              >
                Sačuvaj kao PDF
              </button>
            </div>
          </div>

          {/* Prikaz samo za štampu/PDF - čist spisak bez dugmića */}
          <div className="hidden print:block">
            <h2 className="font-display text-xl font-semibold mb-1">KRAJCARA — Spisak delova za upit</h2>
            <p className="text-sm text-ink/60 mb-4">
              {new Date().toLocaleDateString("sr-RS")}
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink/30 text-left">
                  <th className="py-2">Naziv</th>
                  <th className="py-2">Šifra</th>
                  <th className="py-2">Cena</th>
                </tr>
              </thead>
              <tbody>
                {items.map((part) => (
                  <tr key={part.id} className="border-b border-line">
                    <td className="py-2">{part.name}</td>
                    <td className="py-2">{part.internal_code}</td>
                    <td className="py-2">
                      {part.price != null ? `${part.price} ${part.currency || "RSD"}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 text-sm">
              {phone && <p>Telefon: {phone}</p>}
              {email && <p>E-mail: {email}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
