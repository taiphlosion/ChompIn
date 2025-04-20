const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify user authentication AKA user is logged in.
function verifyToken(req, res, next) {
  const token = req.cookies.token; // Get token from HTTP-only cookie

  if (!token) { return res.status(401).json({ message: "Unauthorized: No token provided" }); }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user data in `req.user` for later use
    next(); // Move to the next middleware or route handler
  } 
  catch (err) { return res.status(401).json({ message: "Unauthorized: Invalid token" }); }
}

// Middleware to enforce role-based access
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) { return res.status(401).json({ message: "Unauthorized: No user data" }); }

    if (!allowedRoles.includes(req.user.role)) { return res.status(403).json({ message: "Forbidden: Access Denied" }); }

    next(); // Move to the next middleware or route handler
  };
}

module.exports = { verifyToken, authorizeRoles };
