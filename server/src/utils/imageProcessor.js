const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config");

/**
 * Uzima privremeni upload-ovani fajl, smanjuje ga na maksimalnu dimenziju
 * i kompresuje kao JPEG, čuva u uploads folder i vraća relativnu putanju.
 * Original (veliki) fajl se ne čuva - samo obrađena verzija.
 */
async function processAndSaveImage(tempFilePath) {
  if (!fs.existsSync(config.uploadsDir)) {
    fs.mkdirSync(config.uploadsDir, { recursive: true });
  }

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.jpg`;
  const outputPath = path.join(config.uploadsDir, filename);

  await sharp(tempFilePath)
    .rotate() // poštuje EXIF orijentaciju (slike sa telefona)
    .resize({
      width: config.imageMaxDimension,
      height: config.imageMaxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: config.imageQuality })
    .toFile(outputPath);

  // Ukloni privremeni originalni fajl
  fs.unlink(tempFilePath, () => {});

  return `/uploads/${filename}`;
}

module.exports = { processAndSaveImage };
