const fs = require("fs");
const path = require("path");
const db = require("./connection");

function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  db.exec(schema);

  // Podrazumevane kategorije - lako se dodaju/menjaju kasnije kroz admin panel
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

  const insertCategory = db.prepare(
    "INSERT OR IGNORE INTO categories (name) VALUES (?)"
  );
  const insertMany = db.transaction((rows) => {
    for (const name of rows) insertCategory.run(name);
  });
  insertMany(defaultCategories);

  // Podrazumevana podešavanja
  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  insertSetting.run("site_under_construction", "true");
  insertSetting.run("banner_text", "KRAJCARA");
  insertSetting.run("contact_phone", "");
  insertSetting.run("contact_email", "");

  console.log("Baza je uspešno inicijalizovana:", require("../config").dbPath);
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
