const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Javno - lista kategorija (za filtere na sajtu)
router.get("/", (req, res) => {
  const categories = db.prepare("SELECT * FROM categories ORDER BY name").all();
  res.json(categories);
});

// Admin - dodavanje nove kategorije
router.post("/", requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Naziv kategorije je obavezan." });
  }
  try {
    const result = db
      .prepare("INSERT INTO categories (name) VALUES (?)")
      .run(name.trim());
    res.status(201).json({ id: result.lastInsertRowid, name: name.trim() });
  } catch (err) {
    res.status(400).json({ error: "Kategorija sa tim nazivom već postoji." });
  }
});

// Admin - izmena kategorije
router.put("/:id", requireAuth, (req, res) => {
  const { name } = req.body;
  db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(
    name.trim(),
    req.params.id
  );
  res.json({ ok: true });
});

// Admin - brisanje kategorije
router.delete("/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
