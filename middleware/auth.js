const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.cookies.authToken; // read from cookie

  if (!token) {
    return res.redirect("/upload/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return res.redirect("/upload/login");
  }
}

module.exports = authMiddleware;
