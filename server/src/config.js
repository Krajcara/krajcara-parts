require("dotenv").config();
const path = require("path");

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  dbPath: path.join(__dirname, "..", "data", "krajcara.db"),
  uploadsDir: path.join(__dirname, "..", "uploads"),
  imageMaxDimension: parseInt(process.env.IMAGE_MAX_DIMENSION || "1200", 10),
  imageQuality: parseInt(process.env.IMAGE_QUALITY || "80", 10),
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
};
