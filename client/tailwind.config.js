/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Industrijska / auto-servis paleta
        graphite: "#1C1D21",   // tamna pozadina (header/footer)
        steel: "#3A5A78",      // hladno plava - sekundarni akcenat
        rust: "#C2571B",       // topla rđasto-narandžasta - CTA / poziv
        canvas: "#F3F1EC",     // svetla pozadina stranice
        ink: "#22252A",        // osnovni tekst
        line: "#DAD6CC",       // linije/border na svetloj pozadini
      },
      fontFamily: {
        display: ["'Oswald'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
