const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(403).json({ message: "Token required" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET || "defaultsecret");

    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRoles,
};
