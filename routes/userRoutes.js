const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUser,getProfile,changePassword,forgotPassword,resetPassword } = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authorizedUser");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update",authenticateUser, updateUser);
router.get("/profile", authenticateUser, getProfile);
router.put("/change-password", authenticateUser, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;