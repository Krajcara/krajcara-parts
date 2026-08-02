const DIACRITICS = {
  č: "c", ć: "c", š: "s", đ: "dj", ž: "z",
  Č: "c", Ć: "c", Š: "s", Đ: "dj", Ž: "z",
};

export function slugify(text) {
  return text
    .split("")
    .map((ch) => DIACRITICS[ch] || ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// Generiše URL slug u formatu {id}-{naziv-i-vozilo} - npr. "1-alternator-bosch-90a-vw-golf-5"
// ID je uvek prvi segment, pa backend uvek zna tačno koji deo treba da vrati
// bez obzira na ostatak teksta (koji je čisto za čitljivost i SEO).
export function partSlug(part) {
  const vehicle = part.vehicles && part.vehicles[0];
  const vehicleText = vehicle ? `${vehicle.make} ${vehicle.model}` : "";
  const base = slugify(`${part.name} ${vehicleText}`);
  return base ? `${part.id}-${base}` : `${part.id}`;
}
