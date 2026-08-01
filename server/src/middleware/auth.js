const jwt = require("jsonwebtoken");
const config = require("../config");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Niste prijavljeni." });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesija je istekla, prijavite se ponovo." });
  }
}

module.exports = requireAuth;
