const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/ratingreviewController");
const { authenticateUser } = require("../middlewares/authorizedUser");

// Add or update review
router.post("/:shelterId", authenticateUser, reviewController.addOrUpdateReview);

// Get all reviews for a shelter
router.get("/:shelterId", reviewController.getReviews);

module.exports = router;
