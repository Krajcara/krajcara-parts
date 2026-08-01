import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function Contact() {
  const { settings, loaded } = useSettings();
  const phone = settings.contact_phone;
  const email = settings.contact_email;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold mb-2">Kontakt</h1>
      <p className="text-ink/60 mb-10">
        Za poručivanje delova i sva pitanja, javite se telefonom ili mejlom.
      </p>

      {!loaded ? (
        <p className="text-ink/50">Učitavanje...</p>
      ) : (
        <div className="bg-white border border-line rounded-lg divide-y divide-line">
          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">Telefon</p>
              {phone ? (
                <p className="text-lg font-medium">{phone}</p>
              ) : (
                <p className="text-ink/40 italic">Telefon još nije unet</p>
              )}
            </div>
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="bg-rust hover:bg-rust/90 transition-colors text-white font-medium px-5 py-2.5 rounded whitespace-nowrap"
              >
                Pozovi
              </a>
            )}
          </div>

          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">E-mail</p>
              {email ? (
                <p className="text-lg font-medium break-all">{email}</p>
              ) : (
                <p className="text-ink/40 italic">E-mail još nije unet</p>
              )}
            </div>
            {email && (
              <a
                href={`mailto:${email}`}
                className="bg-graphite hover:bg-graphite/90 transition-colors text-white font-medium px-5 py-2.5 rounded whitespace-nowrap"
              >
                Pošalji mejl
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 bg-white border border-line rounded-lg p-5">
        <h2 className="font-medium mb-2">Način preuzimanja</h2>
        <ul className="text-sm text-ink/70 space-y-1.5 list-disc list-inside">
          <li>Delovi se šalju <span className="font-medium text-ink">pouzećem</span> — plaćate kuriru prilikom preuzimanja pošiljke.</li>
          <li>Takođe možete <span className="font-medium text-ink">lično preuzeti</span> deo, dogovorom telefonom ili mejlom.</li>
        </ul>
      </div>

      <div className="mt-6 bg-rust/10 border border-rust/30 rounded-lg p-4">
        <p className="text-sm text-ink/80">
          <span className="font-medium">Savet:</span> radi lakšeg i bržeg naručivanja, najbolje je
          da nam izdiktirate <span className="font-medium">interni broj dela</span> (npr.{" "}
          <span className="font-mono">K0001</span>) — nalazi se na stranici svakog dela, odmah
          ispod naziva.
        </p>
      </div>

      <p className="mt-8 text-sm">
        <Link to="/" className="text-steel hover:underline">&larr; Nazad na pretragu delova</Link>
      </p>
    </div>
  );
}
