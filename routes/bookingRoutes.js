// const express = require("express");
// const router = express.Router();
// const bookingController = require("../controllers/bookingcontroller");
// const { authenticateUser, authorizeRoles } = require("../middlewares/authorizedUser");

// // Create new booking
// router.post("/", authenticateUser, bookingController.createBooking);

// // Get my bookings
// router.get("/my-bookings", authenticateUser, bookingController.getMyBookings);

// // eSewa payment verification callback
// router.get("/verify-esewa", bookingController.verifyEsewaPayment);

// // Check payment status manually
// router.get(
//   "/payment-status/:bookingId",
//   authenticateUser,
//   bookingController.checkPaymentStatus
// );

// // Cancel pending payment
// router.post(
//   "/cancel-pending/:bookingId",
//   authenticateUser,
//   bookingController.cancelPendingPayment
// );

// //  Get bookings for my shelter (FIXED)
// router.get(
//   "/shelter",
//   authenticateUser,
//   authorizeRoles("shelter"),
//   bookingController.getShelterBookings
// );

// // Booking history
// router.get("/history", authenticateUser, bookingController.getBookingHistory);

// // Cancel booking
// router.put("/:id/cancel", authenticateUser, bookingController.cancelBooking);

// // Booking details
// router.get("/:id", authenticateUser, bookingController.getBookingDetails);

// // Mark cash as paid
// router.put("/:id/mark-paid", authenticateUser, bookingController.markCashAsPaid);

// // Complete booking
// router.put("/:id/complete", authenticateUser, bookingController.completeBooking);

// module.exports = router;

const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingcontroller");
const { authenticateUser, authorizeRoles } = require("../middlewares/authorizedUser");

// ✅ Create new booking (with room assignments)
router.post("/", authenticateUser, bookingController.createBooking);

// ✅ Get my bookings (for pet owners)
router.get("/my-bookings", authenticateUser, bookingController.getMyBookings);

// ✅ Get booking history (for pet owners)
router.get("/history", authenticateUser, bookingController.getBookingHistory);

// ✅ Get bookings for my shelter (for shelter owners)
router.get(
  "/shelter",
  authenticateUser,
  authorizeRoles("shelter"),
  bookingController.getShelterBookings
);

// ✅ eSewa payment verification callback (public route)
router.get("/verify-esewa", bookingController.verifyEsewaPayment);

// ✅ Check payment status manually
router.get(
  "/payment-status/:bookingId",
  authenticateUser,
  bookingController.checkPaymentStatus
);

// ✅ Cancel pending payment (releases rooms)
router.post(
  "/cancel-pending/:bookingId",
  authenticateUser,
  bookingController.cancelPendingPayment
);

// ✅ Get booking details by ID
router.get("/:id", authenticateUser, bookingController.getBookingDetails);

// ✅ Cancel booking (releases rooms)
router.put("/:id/cancel", authenticateUser, bookingController.cancelBooking);

// ✅ Mark cash payment as paid (for shelter owners)
router.put(
  "/:id/mark-paid",
  authenticateUser,
  authorizeRoles("shelter"),
  bookingController.markCashAsPaid
);

// ✅ Complete booking (releases rooms after checkout)
router.put(
  "/:id/complete",
  authenticateUser,
  authorizeRoles("shelter"),
  bookingController.completeBooking
);

module.exports = router;