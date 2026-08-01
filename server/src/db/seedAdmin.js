const bcrypt = require("bcryptjs");
const db = require("./connection");
const config = require("../config");

function seedAdmin() {
  const existing = db
    .prepare("SELECT id FROM admin_users WHERE username = ?")
    .get(config.adminUsername);

  if (existing) {
    console.log(`Admin nalog "${config.adminUsername}" već postoji, preskačem.`);
    return;
  }

  const hash = bcrypt.hashSync(config.adminPassword, 10);
  db.prepare(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)"
  ).run(config.adminUsername, hash);

  console.log(`Admin nalog "${config.adminUsername}" je kreiran.`);
}

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
