const fs = require("fs");
const path = require("path");
const db = require("./connection");

function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  db.exec(schema);

  // Migracija za baze kreirane pre uvođenja valute - doda kolonu ako ne postoji
  const partsColumns = db.prepare("PRAGMA table_info(parts)").all();
  const hasCurrency = partsColumns.some((col) => col.name === "currency");
  if (!hasCurrency) {
    db.exec("ALTER TABLE parts ADD COLUMN currency TEXT NOT NULL DEFAULT 'RSD'");
    console.log("Migracija: dodata kolona 'currency' u tabelu parts.");
  }

  // Migracija za baze kreirane pre dodatnih proizvođača
  const hasAltManufacturers = partsColumns.some((col) => col.name === "alt_manufacturers");
  if (!hasAltManufacturers) {
    db.exec("ALTER TABLE parts ADD COLUMN alt_manufacturers TEXT DEFAULT '[]'");
    console.log("Migracija: dodata kolona 'alt_manufacturers' u tabelu parts.");
  }

  // Podrazumevane kategorije - ubacuju se SAMO pri prvoj instalaciji (kad je tabela prazna).
  // Nakon toga, admin panel je jedini izvor istine - obrisane kategorije se ne vraćaju
  // nazad prilikom update-a, niti se buduće izmene ovde automatski dodaju.
  const categoryCount = db.prepare("SELECT COUNT(*) AS count FROM categories").get().count;

  if (categoryCount === 0) {
    const defaultCategories = [
      "Motor",
      "Menjač",
      "Elektrika",
      "Karoserija",
      "Enterijer",
      "Kočioni sistem",
      "Ovesni sistem / Amortizeri",
      "Izduvni sistem",
      "Klima uređaj",
    ];

    const insertCategory = db.prepare("INSERT INTO categories (name) VALUES (?)");
    const insertMany = db.transaction((rows) => {
      for (const name of rows) insertCategory.run(name);
    });
    insertMany(defaultCategories);
  }

  // Podrazumevana podešavanja
  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  insertSetting.run("site_under_construction", "true");
  insertSetting.run("banner_text", "KRAJCARA");
  insertSetting.run("contact_phone", "");
  insertSetting.run("contact_phone2", "");

  console.log("Baza je uspešno inicijalizovana:", require("../config").dbPath);
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
