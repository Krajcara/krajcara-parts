import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { partSlug } from "../utils/slugify";

export default function Cart() {
  const { items, removeFromCart } = useCart();
  const { settings } = useSettings();
  const phones = [settings.contact_phone, settings.contact_phone2].filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-2">Korpa</h1>
      <p className="text-ink/60 mb-8">
        Ovo nije online porudžbina — samo spisak delova koje želite da pitate telefonom.
      </p>

      {items.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg p-8 text-center">
          <p className="text-ink/50 mb-4">Korpa je prazna.</p>
          <Link to="/" className="text-steel hover:underline text-sm">
            &larr; Nazad na pretragu delova
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-surface border border-line rounded-lg divide-y divide-line mb-6 print:hidden">
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
                  <Link to={`/delovi/${partSlug(part)}`} className="font-medium hover:text-steel truncate block">
                    {part.name}
                  </Link>
                  <p className="text-xs text-ink/50">Šifra: {part.internal_code}</p>
                  {part.price != null && (
                    <p className="text-sm text-steel font-medium">{part.price} {part.currency || "RSD"}</p>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(part.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline shrink-0 print:hidden"
                >
                  Ukloni
                </button>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-line rounded-lg p-5 print:hidden">
            <h2 className="font-medium mb-4">Pozovite nas za ove delove</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {phones.length > 0 ? (
                phones.map((phone, i) => (
                  <a
                    key={i}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="flex-1 text-center bg-rust hover:bg-rust/90 transition-colors text-white font-medium px-5 py-3 rounded leading-tight"
                  >
                    <span className="block">{phones.length > 1 ? `Pozovite nas ${i + 1}` : "Pozovite nas"}</span>
                    <span className="block text-sm font-normal opacity-90">{phone}</span>
                  </a>
                ))
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
                className="flex-1 text-center bg-surface border border-line hover:bg-canvas transition-colors text-ink font-medium px-5 py-3 rounded"
              >
                Sačuvaj kao PDF
              </button>
            </div>
          </div>

          <div className="mt-6 bg-rust/10 border border-rust/30 rounded-lg p-4 print:hidden">
            <p className="text-sm text-ink/80">
              <span className="font-medium">Molimo vas pozovite nas</span> — na SMS i Viber poruke ne odgovaramo.
            </p>
          </div>

          <div className="mt-6 bg-surface border border-line rounded-lg p-5 print:hidden">
            <h2 className="font-medium mb-2">Način preuzimanja</h2>
            <ul className="text-sm text-ink/70 space-y-1.5 list-disc list-inside">
              <li>Delovi se šalju <span className="font-medium text-ink">pouzećem</span> — plaćate kuriru prilikom preuzimanja pošiljke.</li>
              <li>Takođe možete <span className="font-medium text-ink">lično preuzeti</span> deo, dogovorom telefonom.</li>
            </ul>
          </div>

          <div className="mt-6 bg-rust/10 border border-rust/30 rounded-lg p-4 print:hidden">
            <p className="text-sm text-ink/80">
              <span className="font-medium">Savet:</span> radi lakšeg i bržeg naručivanja, najbolje je
              da nam izdiktirate <span className="font-medium">interni broj dela</span> (npr.{" "}
              <span className="font-mono">K0001</span>) — nalazi se na stranici svakog dela, odmah
              ispod naziva.
            </p>
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
              {phones.map((phone, i) => (
                <p key={i}>Telefon{phones.length > 1 ? ` ${i + 1}` : ""}: {phone}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
