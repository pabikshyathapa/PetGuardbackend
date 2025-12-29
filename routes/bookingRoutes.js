// const express = require("express");
// const router = express.Router();
// const bookingController = require("../controllers/bookingcontroller");
// const { authenticateUser} = require("../middlewares/authorizedUser");

// router.post("/", authenticateUser, bookingController.createBooking);
// router.get("/my-bookings", authenticateUser, bookingController.getMyBookings);
// router.get("/verify-esewa", bookingController.verifyEsewaPayment); // ✅ Important
// // eSewa Payment Routes (No auth needed - eSewa redirects here)
// router.get("/verify-esewa", bookingController.verifyEsewaPayment);

// // NEW: Check payment status
// router.get("/payment-status/:bookingId", authenticateUser, bookingController.checkPaymentStatus);

// // NEW: Cancel pending payment
// router.post("/cancel-pending/:bookingId", authenticateUser, bookingController.cancelPendingPayment);

// // Shelter
// router.get("/shelter", authenticateUser, bookingController.getShelterBookings);

// // Cancel
// router.put("/:id/cancel", authenticateUser, bookingController.cancelBooking);

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const bookingController = require("../controllers/bookingcontroller");
// const { authenticateUser,authorizeRoles } = require("../middlewares/authorizedUser");
// // Create new booking
// router.post("/", authenticateUser, bookingController.createBooking);

// // Get my bookings
// router.get("/my-bookings", authenticateUser, bookingController.getMyBookings);

// // eSewa payment verification callback
// router.get("/verify-esewa", bookingController.verifyEsewaPayment);

// // Check payment status manually
// router.get("/payment-status/:bookingId", authenticateUser, bookingController.checkPaymentStatus);

// // Cancel pending payment
// router.post("/cancel-pending/:bookingId", authenticateUser, bookingController.cancelPendingPayment);



// // Get bookings for my shelter
// router.get(
//   "/shelter",
//   authenticateUser,
//   authorizeRoles("shelter"),
//   bookingController.getShelterBookings
// );


// // Cancel booking
// router.put("/:id/cancel", authenticateUser, bookingController.cancelBooking);
// router.get("/:id", authenticateUser, bookingController.getBookingDetails);
// router.put("/:id/mark-paid", authenticateUser, bookingController.markCashAsPaid);
// router.put("/:id/complete", authenticateUser, bookingController.completeBooking);



// // Test route to manually mark payment as successful
// // ONLY FOR TESTING - REMOVE BEFORE DEPLOYING TO PRODUCTION
// if (process.env.NODE_ENV !== 'production') {
//   router.post("/test-payment-success/:bookingId", authenticateUser, async (req, res) => {
//     try {
//       const Booking = require("../models/booking");
//       const booking = await Booking.findByIdAndUpdate(
//         req.params.bookingId,
//         {
//           "payment.status": "paid",
//           "payment.transactionId": "TEST-" + Date.now(),
//         },
//         { new: true }
//       );
      
//       if (!booking) {
//         return res.status(404).json({ message: "Booking not found" });
//       }
      
//       console.log("⚠️ TEST: Payment marked as successful:", booking._id);
//       res.json({ 
//         success: true, 
//         message: "TEST: Payment marked as successful",
//         booking 
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Test payment update failed", error: error.message });
//     }
//   });
// }

// module.exports = router;

const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingcontroller");
const { authenticateUser, authorizeRoles } = require("../middlewares/authorizedUser");

// Create new booking
router.post("/", authenticateUser, bookingController.createBooking);

// Get my bookings
router.get("/my-bookings", authenticateUser, bookingController.getMyBookings);

// eSewa payment verification callback
router.get("/verify-esewa", bookingController.verifyEsewaPayment);

// Check payment status manually
router.get(
  "/payment-status/:bookingId",
  authenticateUser,
  bookingController.checkPaymentStatus
);

// Cancel pending payment
router.post(
  "/cancel-pending/:bookingId",
  authenticateUser,
  bookingController.cancelPendingPayment
);

// ✅ Get bookings for my shelter (FIXED)
router.get(
  "/shelter",
  authenticateUser,
  authorizeRoles("shelter"),
  bookingController.getShelterBookings
);

// Cancel booking
router.put("/:id/cancel", authenticateUser, bookingController.cancelBooking);

// Booking details
router.get("/:id", authenticateUser, bookingController.getBookingDetails);

// Mark cash as paid
router.put("/:id/mark-paid", authenticateUser, bookingController.markCashAsPaid);

// Complete booking
router.put("/:id/complete", authenticateUser, bookingController.completeBooking);

module.exports = router;
