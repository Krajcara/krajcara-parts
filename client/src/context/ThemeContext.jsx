import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ThemeContext = createContext(null);

function storageKey(isAdmin) {
  return isAdmin ? "krajcara_theme_admin" : "krajcara_theme_public";
}

function getStoredTheme(isAdmin) {
  return localStorage.getItem(storageKey(isAdmin)) || "light";
}

export function ThemeProvider({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [theme, setTheme] = useState(() => getStoredTheme(isAdmin));

  // Kad se predje iz javnog sajta u admin panel (ili obrnuto), učitaj
  // sačuvani izbor za TU sekciju - svetli/tamni režim su odvojeni.
  useEffect(() => {
    setTheme(getStoredTheme(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(storageKey(isAdmin), next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
