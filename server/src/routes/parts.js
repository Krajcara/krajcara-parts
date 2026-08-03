const express = require("express");
const multer = require("multer");
const os = require("os");
const db = require("../db/connection");
const requireAuth = require("../middleware/auth");
const { processAndSaveImage } = require("../utils/imageProcessor");

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

function generateInternalCode() {
  const last = db
    .prepare("SELECT internal_code FROM parts ORDER BY id DESC LIMIT 1")
    .get();
  let nextNum = 1;
  if (last && last.internal_code) {
    const match = last.internal_code.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `K${String(nextNum).padStart(4, "0")}`;
}

function attachVehicles(part) {
  const vehicles = db
    .prepare(
      `SELECT v.* FROM vehicles v
       JOIN part_vehicle_compatibility pvc ON pvc.vehicle_id = v.id
       WHERE pvc.part_id = ?`
    )
    .all(part.id);
  return { ...part, vehicles, extra_attributes: JSON.parse(part.extra_attributes || "{}") };
}

// -------- Javna pretraga --------
// Podržava: q (OEM ili interni broj ili naziv), category_id, status, vehicle_id
router.get("/", (req, res) => {
  const { q, category_id, status, vehicle_id, make, model } = req.query;

  let query = `SELECT DISTINCT p.* FROM parts p`;
  const params = [];
  const conditions = ["p.availability_status = 'aktivno'"];

  if (vehicle_id || make || model) {
    query += ` JOIN part_vehicle_compatibility pvc ON pvc.part_id = p.id
               JOIN vehicles v ON v.id = pvc.vehicle_id`;

    if (vehicle_id) {
      // Tačno izabrana generacija/motor - najprecizniji filter
      conditions.push("v.id = ?");
      params.push(vehicle_id);
    } else {
      // Filtriraj po marki i/ili modelu i pre nego što je tačno vozilo izabrano
      if (make) {
        conditions.push("v.make = ?");
        params.push(make);
      }
      if (model) {
        conditions.push("v.model = ?");
        params.push(model);
      }
    }
  }

  if (q) {
    conditions.push("(p.oem_number LIKE ? OR p.internal_code LIKE ? OR p.name LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category_id) {
    conditions.push("p.category_id = ?");
    params.push(category_id);
  }
  if (status) {
    conditions.push("p.status = ?");
    params.push(status);
  }

  query += " WHERE " + conditions.join(" AND ") + " ORDER BY p.created_at DESC";

  const parts = db.prepare(query).all(...params);
  res.json(parts.map(attachVehicles));
});

// Admin - pregled svih delova (uključujući neaktivne), bez filtera na availability
router.get("/admin", requireAuth, (req, res) => {
  const parts = db.prepare("SELECT * FROM parts ORDER BY created_at DESC").all();
  res.json(parts.map(attachVehicles));
});

// Admin - predlog sledećeg internog broja (za prefill u formi, korisnik ga može promeniti)
router.get("/next-code", requireAuth, (req, res) => {
  res.json({ code: generateInternalCode() });
});

// Javno - detalji jednog dela
// Admin - statistika zarade od prodatih delova, grupisano po valuti
router.get("/stats/earnings", requireAuth, (req, res) => {
  const sold = db
    .prepare(
      `SELECT p.*, c.name AS category_name
       FROM parts p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.availability_status = 'prodato'
       ORDER BY p.updated_at DESC`
    )
    .all();

  const totals = { RSD: { count: 0, total: 0 }, EUR: { count: 0, total: 0 } };
  for (const p of sold) {
    const cur = p.currency === "EUR" ? "EUR" : "RSD";
    totals[cur].count += 1;
    totals[cur].total += p.price || 0;
  }

  res.json({ totals, items: sold });
});

// Javno - detalji jednog dela. Prihvata i čist broj (staro ponašanje) i SEO slug
// u formatu "{id}-{opisni-tekst}" (npr. "12-alternator-bosch-90a-vw-golf-5") -
// ID je uvek prvi segment, ostatak je samo za čitljivost i ne utiče na pretragu.
router.get("/:slug", (req, res) => {
  const match = req.params.slug.match(/^(\d+)/);
  if (!match) return res.status(404).json({ error: "Deo nije pronađen." });

  const part = db.prepare("SELECT * FROM parts WHERE id = ?").get(match[1]);
  if (!part) return res.status(404).json({ error: "Deo nije pronađen." });
  res.json(attachVehicles(part));
});

// Admin - kreiranje novog dela (sa opcionom slikom)
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const {
      internal_code, name, category_id, oem_number, brand_code, brand,
      status, repair_notes, description, price, currency,
      quantity, availability_status, extra_attributes, vehicle_ids,
    } = req.body;

    if (!name || !status) {
      return res.status(400).json({ error: "Naziv i status su obavezni." });
    }

    let finalCode = (internal_code || "").trim();
    if (finalCode) {
      const clash = db
        .prepare("SELECT id FROM parts WHERE internal_code = ?")
        .get(finalCode);
      if (clash) {
        return res.status(400).json({ error: `Broj dela "${finalCode}" je već zauzet.` });
      }
    } else {
      finalCode = generateInternalCode();
    }

    let imagePath = null;
    if (req.file) {
      imagePath = await processAndSaveImage(req.file.path);
    }

    const result = db
      .prepare(
        `INSERT INTO parts
         (internal_code, name, category_id, oem_number, brand_code, brand, status,
          repair_notes, description, price, currency, image_path, quantity, availability_status, extra_attributes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        finalCode, name, category_id || null, oem_number || null,
        brand_code || null, brand || null, status,
        repair_notes || null, description || null, price || null,
        currency || "RSD", imagePath, quantity || 1, availability_status || "aktivno",
        extra_attributes || "{}"
      );

    const partId = result.lastInsertRowid;

    // Kompatibilna vozila (vehicle_ids je JSON string niza id-jeva)
    if (vehicle_ids) {
      const ids = JSON.parse(vehicle_ids);
      const insertCompat = db.prepare(
        "INSERT OR IGNORE INTO part_vehicle_compatibility (part_id, vehicle_id) VALUES (?, ?)"
      );
      for (const vId of ids) insertCompat.run(partId, vId);
    }

    const created = db.prepare("SELECT * FROM parts WHERE id = ?").get(partId);
    res.status(201).json(attachVehicles(created));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška prilikom kreiranja dela." });
  }
});

// Admin - izmena dela (sa opcionom novom slikom)
router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM parts WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Deo nije pronađen." });

    const {
      internal_code, name, category_id, oem_number, brand_code, brand,
      status, repair_notes, description, price, currency,
      quantity, availability_status, extra_attributes, vehicle_ids,
    } = req.body;

    let finalCode = existing.internal_code;
    const requestedCode = (internal_code || "").trim();
    if (requestedCode && requestedCode !== existing.internal_code) {
      const clash = db
        .prepare("SELECT id FROM parts WHERE internal_code = ? AND id != ?")
        .get(requestedCode, req.params.id);
      if (clash) {
        return res.status(400).json({ error: `Broj dela "${requestedCode}" je već zauzet.` });
      }
      finalCode = requestedCode;
    }

    let imagePath = existing.image_path;
    if (req.file) {
      imagePath = await processAndSaveImage(req.file.path);
    }

    db.prepare(
      `UPDATE parts SET
        internal_code=?, name=?, category_id=?, oem_number=?, brand_code=?, brand=?, status=?,
        repair_notes=?, description=?, price=?, currency=?, image_path=?, quantity=?,
        availability_status=?, extra_attributes=?, updated_at=datetime('now')
       WHERE id=?`
    ).run(
      finalCode, name, category_id || null, oem_number || null, brand_code || null,
      brand || null, status, repair_notes || null, description || null,
      price || null, currency || "RSD", imagePath, quantity || 1, availability_status || "aktivno",
      extra_attributes || "{}", req.params.id
    );

    if (vehicle_ids) {
      db.prepare("DELETE FROM part_vehicle_compatibility WHERE part_id = ?").run(req.params.id);
      const ids = JSON.parse(vehicle_ids);
      const insertCompat = db.prepare(
        "INSERT OR IGNORE INTO part_vehicle_compatibility (part_id, vehicle_id) VALUES (?, ?)"
      );
      for (const vId of ids) insertCompat.run(req.params.id, vId);
    }

    const updated = db.prepare("SELECT * FROM parts WHERE id = ?").get(req.params.id);
    res.json(attachVehicles(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška prilikom izmene dela." });
  }
});

// Admin - brisanje dela
router.delete("/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM parts WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
