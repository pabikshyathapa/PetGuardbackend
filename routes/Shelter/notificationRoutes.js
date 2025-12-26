const express = require("express");
const router = express.Router();
const { getUserNotifications, markAsRead } = require("../../controllers/Shelter/notificationcontroller");
const { authenticateUser } = require("../../middlewares/authorizedUser");

router.get("/", authenticateUser, getUserNotifications);
router.put("/:id/read", authenticateUser, markAsRead);

module.exports = router;