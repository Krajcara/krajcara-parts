-- Krajcara.com - šema baze podataka
-- Hibridni pristup: osnovna polja su fiksne kolone (brza pretraga/filtriranje),
-- specifična polja po kategoriji (elektrika, karoserija...) idu u extra_attributes (JSON),
-- tako da se lako dodaju nova polja bez izmene šeme baze.

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  generation TEXT,
  year_from INTEGER,
  year_to INTEGER,
  engine TEXT
);

CREATE TABLE IF NOT EXISTS parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  internal_code TEXT UNIQUE NOT NULL,      -- npr. KRJ-000123
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  oem_number TEXT,
  brand_code TEXT,                          -- brend kod (npr. Bosch kod), različit od OEM
  brand TEXT,                               -- proizvođač dela
  status TEXT NOT NULL CHECK (status IN ('novo', 'polovno', 'reparirano')),
  repair_notes TEXT,                        -- popunjava se samo ako je status = reparirano
  description TEXT,
  price REAL,
  currency TEXT NOT NULL DEFAULT 'RSD' CHECK (currency IN ('RSD', 'EUR')),
  image_path TEXT,                          -- putanja do (smanjene) slike na disku
  quantity INTEGER DEFAULT 1,
  availability_status TEXT NOT NULL DEFAULT 'aktivno'
    CHECK (availability_status IN ('aktivno', 'rezervisano', 'prodato')),
  extra_attributes TEXT DEFAULT '{}',       -- JSON: napon, amperaza, testirano, garancija, lokacija...
  alt_manufacturers TEXT DEFAULT '[]',      -- JSON niz [{brand, code}] - dodatni/alternativni proizvođači (opciono)
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS part_vehicle_compatibility (
  part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  PRIMARY KEY (part_id, vehicle_id)
);

-- Opšta podešavanja sajta (npr. "sajt u izradi" banner, tekst banera)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_parts_oem ON parts(oem_number);
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
