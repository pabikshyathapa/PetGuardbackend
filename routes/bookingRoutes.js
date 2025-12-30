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

//  Get bookings for my shelter (FIXED)
router.get(
  "/shelter",
  authenticateUser,
  authorizeRoles("shelter"),
  bookingController.getShelterBookings
);

// Booking history
router.get("/history", authenticateUser, bookingController.getBookingHistory);

// Cancel booking
router.put("/:id/cancel", authenticateUser, bookingController.cancelBooking);

// Booking details
router.get("/:id", authenticateUser, bookingController.getBookingDetails);

// Mark cash as paid
router.put("/:id/mark-paid", authenticateUser, bookingController.markCashAsPaid);

// Complete booking
router.put("/:id/complete", authenticateUser, bookingController.completeBooking);

module.exports = router;
