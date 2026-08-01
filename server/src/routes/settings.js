const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Javno - trenutna podešavanja (za prikaz banera na sajtu)
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const settings = {};
  rows.forEach((r) => (settings[r.key] = r.value));
  res.json(settings);
});

// Admin - izmena podešavanja (npr. isključivanje "sajt u izradi" kad se lansira)
router.put("/", requireAuth, (req, res) => {
  const updates = req.body; // { key: value, ... }
  const upsert = db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  );
  const runAll = db.transaction((entries) => {
    for (const [key, value] of entries) upsert.run(key, String(value));
  });
  runAll(Object.entries(updates));
  res.json({ ok: true });
});

module.exports = router;
