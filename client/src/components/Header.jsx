import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-graphite">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/">
          <span className="font-display uppercase tracking-[0.25em] text-3xl md:text-4xl font-semibold text-white">
            KRAJCARA
          </span>
        </Link>
        <Link
          to="/kontakt"
          className="hidden md:inline-flex items-center gap-2 bg-rust hover:bg-rust/90 transition-colors text-white font-medium px-5 py-2.5 rounded"
        >
          Pozovite nas
        </Link>
      </div>
    </header>
  );
}
