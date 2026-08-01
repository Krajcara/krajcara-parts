const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/connection");
const config = require("../config");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Unesite korisničko ime i lozinku." });
  }

  const admin = db
    .prepare("SELECT * FROM admin_users WHERE username = ?")
    .get(username);

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Pogrešno korisničko ime ili lozinka." });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    config.jwtSecret,
    { expiresIn: "12h" }
  );

  res.json({ token, username: admin.username });
});

module.exports = router;
