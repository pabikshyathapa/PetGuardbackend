// const Shelter = require("../models/Shelter/shelter");
// const Notification = require("../models/notification");

// // Add or update a review
// exports.addOrUpdateReview = async (req, res) => {
//   const { shelterId } = req.params;
//   const { rating, comment } = req.body;
//   const userId = req.user._id; // get userId from auth middleware

//   try {
//     const shelter = await Shelter.findById(shelterId);
//     if (!shelter) return res.status(404).json({ message: "Shelter not found" });

//     // Check if user already reviewed
//     const existingReviewIndex = shelter.reviews.findIndex(
//       (r) => r.user.toString() === userId.toString()
//     );

//     if (existingReviewIndex > -1) {
//       // Update review
//       shelter.reviews[existingReviewIndex].rating = rating;
//       shelter.reviews[existingReviewIndex].comment = comment;
//     } else {
//       // Add new review
//       shelter.reviews.push({ user: userId, rating, comment });
//     }

//     // Update average rating & review count
//     shelter.reviewCount = shelter.reviews.length;
//     shelter.averageRating =
//       shelter.reviews.reduce((acc, r) => acc + r.rating, 0) / shelter.reviewCount;

//     await shelter.save();

//     // Send notification to shelter owner
//    const reviewer = await User.findById(userId); // Assuming you have a User model

// await Notification.create({
//   user: shelter.user, // The owner
//   message: `${reviewer.name} left a ${rating}-star review on your shelter!`,
// });

//     res.status(200).json({ message: "Review submitted successfully", shelter });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get all reviews for a shelter
// exports.getReviews = async (req, res) => {
//   const { shelterId } = req.params;
//   try {
//     const shelter = await Shelter.findById(shelterId).populate("reviews.user", "name");
//     if (!shelter) return res.status(404).json({ message: "Shelter not found" });

//     res.status(200).json({ reviews: shelter.reviews, averageRating: shelter.averageRating });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };
const Shelter = require("../models/Shelter/shelter");
const Notification = require("../models/notification");
const User = require("../models/User"); // 1. Ensure User model is imported

// Add or update a review
exports.addOrUpdateReview = async (req, res) => {
  const { shelterId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id; 

  try {
    const shelter = await Shelter.findById(shelterId);
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    // Check if user already reviewed
    const existingReviewIndex = shelter.reviews.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReviewIndex > -1) {
      // Update existing review
      shelter.reviews[existingReviewIndex].rating = rating;
      shelter.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add new review
      shelter.reviews.push({ user: userId, rating, comment });
    }

    // Update average rating & review count
    shelter.reviewCount = shelter.reviews.length;
    shelter.averageRating =
      shelter.reviews.reduce((acc, r) => acc + r.rating, 0) / shelter.reviewCount;

    await shelter.save();

    // 2. Fetch the reviewer details for a better notification message
    const reviewer = await User.findById(userId);
    const reviewerName = reviewer ? reviewer.name : "A user";

    // 3. Create the rich notification message
    // Format: "Sarah Dashdash added a new review: 'Loved the place!' (4 stars)"
    await Notification.create({
      user: shelter.user, // The owner of the shelter
      message: `${reviewerName} added a new review: "${comment}" with a ${rating}-star rating.`,
    });

    res.status(200).json({ message: "Review submitted successfully", shelter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all reviews for a shelter
exports.getReviews = async (req, res) => {
  const { shelterId } = req.params;
  try {
    // Populate user name so frontend can display who wrote the review
    const shelter = await Shelter.findById(shelterId).populate("reviews.user", "name");
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    res.status(200).json({ 
      reviews: shelter.reviews, 
      averageRating: shelter.averageRating,
      reviewCount: shelter.reviewCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};