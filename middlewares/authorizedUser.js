// const jwt = require("jsonwebtoken");
// const User = require('../models/User');

// // validation middlewares
// const validateSignup = (req, res, next) => {
//   const { name, email, phone, password } = req.body;
//   if (!name || !email || !phone || !password) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }
//   if (!/\S+@\S+\.\S+/.test(email)) {
//     return res.status(400).json({ message: 'Invalid email format' });
//   }
//   if (password.length < 6) {
//     return res.status(400).json({ message: 'Password must be at least 6 characters' });
//   }
//   next();
// };

// const validateLogin = (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }
//   next();
// };

// // auth middlewares
// const authenticateUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(403).json({ success: false, message: "Token required" });

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.SECRET);
//     const user = await User.findById(decoded._id);

//     if (!user) return res.status(401).json({ success: false, message: "User not found" });

//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(500).json({ success: false, message: "Authentication error" });
//   }
// };

// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     return res.status(403).json({ success: false, message: "Access denied, not admin" });
//   }
// };

// module.exports = {
//   validateSignup,
//   validateLogin,
//   authenticateUser,
//   isAdmin,
// };

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
