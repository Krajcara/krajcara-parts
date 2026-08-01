const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const config = require("./config");

// Osiguraj da je baza inicijalizovana (bezopasno da se pozove više puta - IF NOT EXISTS)
require("./db/init")();

const authRoutes = require("./routes/auth");
const partsRoutes = require("./routes/parts");
const vehiclesRoutes = require("./routes/vehicles");
const categoriesRoutes = require("./routes/categories");
const settingsRoutes = require("./routes/settings");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statičke slike delova
app.use("/uploads", express.static(config.uploadsDir));

// API rute
app.use("/api/auth", authRoutes);
app.use("/api/parts", partsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Servira produkcioni build React aplikacije (client/dist)
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(config.port, () => {
  console.log(`Krajcara server radi na portu ${config.port}`);
});
