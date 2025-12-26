const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favouriteController");
const { authenticateUser, authorizeRoles } = require("../middlewares/authorizedUser");

// All routes require authentication and petowner role
router.use(authenticateUser);
router.use(authorizeRoles("petowner"));

// Add shelter to favorites
router.post("/add", favoritesController.addToFavorites);

// Remove shelter from favorites
router.delete("/remove/:shelterId", favoritesController.removeFromFavorites);

// Get all favorite shelters
router.get("/", favoritesController.getFavorites);

// Check if a shelter is in favorites
router.get("/check/:shelterId", favoritesController.checkFavorite);

// Toggle favorite (add or remove)
router.post("/toggle", favoritesController.toggleFavorite);

module.exports = router;