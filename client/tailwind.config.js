/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Industrijska / auto-servis paleta - vrednosti dolaze iz CSS promenljivih
        // definisanih u index.css, tako da se automatski menjaju sa .dark klasom
        // na <html> elementu, bez potrebe da se svaka komponenta pojedinačno menja.
        graphite: "rgb(var(--color-graphite) / <alpha-value>)",
        steel: "rgb(var(--color-steel) / <alpha-value>)",
        rust: "rgb(var(--color-rust) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Oswald'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
