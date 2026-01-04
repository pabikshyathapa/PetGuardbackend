const express = require("express");
const router = express.Router();
const { getUserNotifications, markAsRead,markAllAsRead} = require("../../controllers/Shelter/notificationcontroller");
const { authenticateUser } = require("../../middlewares/authorizedUser");

router.get("/", authenticateUser, getUserNotifications);
router.put("/:id/read", authenticateUser, markAsRead);
router.put("/read-all", authenticateUser, markAllAsRead);



module.exports = router;