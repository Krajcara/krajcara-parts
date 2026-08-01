const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Javno - lista vozila, opciono filtrirano (za napravu pretragu na sajtu)
router.get("/", (req, res) => {
  const { make, model } = req.query;
  let query = "SELECT * FROM vehicles WHERE 1=1";
  const params = [];

  if (make) {
    query += " AND make = ?";
    params.push(make);
  }
  if (model) {
    query += " AND model = ?";
    params.push(model);
  }

  query += " ORDER BY make, model, generation";
  const vehicles = db.prepare(query).all(...params);
  res.json(vehicles);
});

// Javno - distinct liste za dropdown-ove u pretrazi (marka -> model -> generacija)
router.get("/makes", (req, res) => {
  const rows = db
    .prepare("SELECT DISTINCT make FROM vehicles ORDER BY make")
    .all();
  res.json(rows.map((r) => r.make));
});

router.get("/models", (req, res) => {
  const { make } = req.query;
  const rows = db
    .prepare("SELECT DISTINCT model FROM vehicles WHERE make = ? ORDER BY model")
    .all(make);
  res.json(rows.map((r) => r.model));
});

// Admin - dodavanje vozila
router.post("/", requireAuth, (req, res) => {
  const { make, model, generation, year_from, year_to, engine } = req.body;
  if (!make || !model) {
    return res.status(400).json({ error: "Marka i model su obavezni." });
  }
  const result = db
    .prepare(
      `INSERT INTO vehicles (make, model, generation, year_from, year_to, engine)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(make, model, generation || null, year_from || null, year_to || null, engine || null);
  res.status(201).json({ id: result.lastInsertRowid });
});

// Admin - izmena vozila
router.put("/:id", requireAuth, (req, res) => {
  const { make, model, generation, year_from, year_to, engine } = req.body;
  db.prepare(
    `UPDATE vehicles SET make=?, model=?, generation=?, year_from=?, year_to=?, engine=?
     WHERE id=?`
  ).run(make, model, generation || null, year_from || null, year_to || null, engine || null, req.params.id);
  res.json({ ok: true });
});

// Admin - brisanje vozila
router.delete("/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM vehicles WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
