const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUser } = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authorizedUser");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update",authenticateUser, updateUser);

module.exports = router;
