import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { items } = useCart();

  return (
    <header className="bg-graphite">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/">
          <span className="font-display uppercase tracking-[0.25em] text-3xl md:text-4xl font-semibold text-white">
            KRAJCARA
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle className="bg-white/10 hover:bg-white/20 text-white" />
          <Link
            to="/korpa"
            className="relative inline-flex items-center justify-center w-11 h-11 rounded bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Korpa"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rust text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
          <Link
            to="/kontakt"
            className="hidden md:inline-flex items-center gap-2 bg-rust hover:bg-rust/90 transition-colors text-white font-medium px-5 py-2.5 rounded"
          >
            Pozovite nas
          </Link>
        </div>
      </div>
    </header>
  );
}
