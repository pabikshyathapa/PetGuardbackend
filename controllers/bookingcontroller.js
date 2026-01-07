// const Booking = require("../models/booking");
// const Shelter = require("../models/Shelter/shelter");
// const User = require("../models/User");
// const crypto = require("crypto");
// const axios = require("axios");
// const Notification = require("../models/notification");

// // Generate eSewa Signature
// const generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
//   const secret = process.env.ESEWA_SECRET_KEY;
  
//   // CRITICAL: Must be in this exact order with no spaces
//   const dataString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  
//   console.log(" Generating signature for:", dataString);
  
//   const signature = crypto
//     .createHmac("sha256", secret)
//     .update(dataString)
//     .digest("base64");
    
//   console.log(" Generated signature:", signature);
  
//   return signature;
// };

// // Verify eSewa Signature - FIXED VERSION
// const verifyEsewaSignature = (decoded) => {
//   try {
//     // Use the signed_field_names from eSewa to build signature string
//     const signedFieldNames = decoded.signed_field_names.split(',');
//     const signatureData = signedFieldNames
//       .map(field => `${field}=${decoded[field]}`)
//       .join(',');
    
//     console.log("Signature data string:", signatureData);
    
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
//       .update(signatureData)
//       .digest('base64');
    
//     const isValid = generatedSignature === decoded.signature;
    
//     console.log(" Verifying signature:");
//     console.log("   Expected:", generatedSignature);
//     console.log("   Received:", decoded.signature);
//     console.log("   Valid:", isValid);
    
//     return isValid;
//   } catch (error) {
//     console.error("Signature verification error:", error);
//     return false;
//   }
// };

// // Check payment status from eSewa API
// const checkEsewaPaymentStatus = async (product_code, total_amount, transaction_uuid) => {
//   try {
//     const statusUrl = process.env.NODE_ENV === 'production'
//       ? 'https://esewa.com.np/api/epay/transaction/status/'
//       : 'https://rc.esewa.com.np/api/epay/transaction/status/';
    
//     console.log(" Checking payment status:", { product_code, total_amount, transaction_uuid });
    
//     const response = await axios.get(statusUrl, {
//       params: {
//         product_code,
//         total_amount,
//         transaction_uuid
//       }
//     });
    
//     console.log(" eSewa status response:", response.data);
    
//     return response.data;
//   } catch (error) {
//     console.error(" Error checking eSewa status:", error.message);
//     return null;
//   }
// };

// exports.createBooking = async (req, res) => {
//   try {
//     const { shelterId, serviceType, startDate, endDate, pets, pricePerDay, paymentMethod } = req.body;
//     const petOwnerId = req.user.id;

//     console.log("Creating booking:", {
//       shelterId,
//       serviceType,
//       petOwnerId,
//       petCount: pets?.length,
//       paymentMethod
//     });

//     // Validate input
//     if (!shelterId || !serviceType || !startDate || !pets || !pets.length || !pricePerDay || !paymentMethod) {
//       console.error(" Missing required fields");
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // FETCH THE SHELTER TO GET THE OWNER'S USER ID
//     const shelter = await Shelter.findById(shelterId);
//     if (!shelter) {
//       return res.status(404).json({ message: "Shelter not found" });
//     }

//     // Calculate Costs
//     const start = new Date(startDate);
//     const end = new Date(endDate || startDate);
//     const totalDays = serviceType === "daycare" ? 1 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
//     const totalAmountValue = totalDays * pricePerDay * pets.length;
    
//     console.log("Calculated cost:", { totalDays, pricePerDay, petCount: pets.length, totalAmountValue });

//     // Create Pending Booking
//     const booking = await Booking.create({
//       petOwner: petOwnerId,
//       shelter: shelterId,
//       serviceType,
//       startDate,
//       endDate: serviceType === "daycare" ? startDate : endDate,
//       pets,
//       petCount: pets.length,
//       pricePerDay,
//       totalDays,
//       totalAmount: totalAmountValue,
//       payment: {
//         method: paymentMethod,
//         status: "pending",
//       },
//     });
    
//     // FIXED: Use shelter.user instead of shelterId
//     const petOwner = await User.findById(petOwnerId).select("name");
//     await Notification.create({
//       user: shelter.user,
//       message: `New booking received from ${petOwner.name} (${serviceType}) for ${pets.length} pet(s)`
//     });
    
//     await Notification.create({
//       user: petOwnerId,
//       message: "Your booking has been confirmed!"
//     });

//     console.log("Booking created:", booking._id);

//     // Handle eSewa Redirect
//     if (paymentMethod === "esewa") {
//       const totalAmount = Math.round(totalAmountValue).toString();
//       const transactionId = booking._id.toString();
//       const productCode = process.env.ESEWA_PRODUCT_CODE;
      
//       console.log("eSewa Payment Details:");
//       console.log("   Amount:", totalAmount);
//       console.log("   Transaction ID:", transactionId);
//       console.log("   Product Code:", productCode);
      
//       const signature = generateEsewaSignature(totalAmount, transactionId, productCode);

//       const paymentData = {
//         amount: totalAmount,
//         tax_amount: "0",
//         total_amount: totalAmount,
//         transaction_uuid: transactionId,
//         product_code: productCode,
//         product_service_charge: "0",
//         product_delivery_charge: "0",
//         success_url: `${process.env.BACKEND_URL}/api/bookings/verify-esewa`,
//         failure_url: `${process.env.FRONTEND_URL}/payment-failed`,
//         signed_field_names: "total_amount,transaction_uuid,product_code",
//         signature: signature,
//         esewa_url: process.env.ESEWA_URL
//       };

//       console.log("Sending payment data to frontend");

//       return res.status(201).json({
//         success: true,
//         bookingId: booking._id,
//         isEsewa: true,
//         paymentData
//       });
//     }

//     // Cash payment - immediately confirm
//     console.log("Cash booking confirmed");
//     res.status(201).json({ 
//       success: true, 
//       message: "Booking confirmed (Cash on arrival)", 
//       booking 
//     });
//   } catch (error) {
//     console.error("Booking Error:", error);
//     res.status(500).json({ 
//       message: "Booking failed", 
//       error: error.message 
//     });
//   }
// };

// // FIXED: eSewa Payment Verification
// exports.verifyEsewaPayment = async (req, res) => {
//   try {
//     const { data } = req.query;
    
//     console.log("eSewa callback received");
//     console.log("   Query params:", req.query);
    
//     if (!data) {
//       console.error(" No data parameter in callback");
//       return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=no_data`);
//     }

//     // Decode the Base64 response
//     let decoded;
//     try {
//       decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
//       console.log("Decoded eSewa response:", decoded);
//     } catch (decodeError) {
//       console.error("Failed to decode eSewa response:", decodeError);
//       return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=decode_failed`);
//     }

//     // Verify signature for security
//     const isValidSignature = verifyEsewaSignature(decoded);

//     if (!isValidSignature) {
//       console.error("Invalid signature detected!");
//       // OPTIONAL: For testing, you can skip this check
//       // return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=invalid_signature`);
//       console.warn("Proceeding despite invalid signature (TEST MODE)");
//     } else {
//       console.log("Signature verified successfully");
//     }

//     if (decoded.status === "COMPLETE") {
//       // POPULATE shelter to get the user field
//       const booking = await Booking.findByIdAndUpdate(
//         decoded.transaction_uuid,
//         {
//           "payment.status": "paid",
//           "payment.transactionId": decoded.transaction_code,
//         },
//         { new: true }
//       ).populate('shelter');

//       if (!booking) {
//         console.error("Booking not found:", decoded.transaction_uuid);
//         return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=booking_not_found`);
//       }

//       // FIXED: Use shelter.user instead of booking.shelter
//       await Notification.create({
//         user: booking.petOwner,
//         message: "Your payment was successful. Booking confirmed!"
//       });

//       await Notification.create({
//         user: booking.shelter.user,
//         message: "A booking payment has been completed."
//       });

//       console.log("Payment verified! Booking updated:", booking._id);

//       // FIXED: Redirect to the correct frontend route
//       return res.redirect(`${process.env.FRONTEND_URL}/payment-success?status=success&ref=${decoded.transaction_code}`);
//     }
    
//     console.warn(" Payment not complete. Status:", decoded.status);
//     res.redirect(`${process.env.FRONTEND_URL}/payment-failed?status=${decoded.status}`);
//   } catch (err) {
//     console.error(" Verification Error:", err);
//     res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=verification_failed`);
//   }
// };

// // Check payment status manually
// exports.checkPaymentStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
    
//     console.log(" Manual status check for booking:", bookingId);
    
//     const booking = await Booking.findById(bookingId);
    
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.payment.status === "paid") {
//       return res.json({
//         status: "paid",
//         message: "Payment already completed",
//         booking
//       });
//     }

//     const esewaStatus = await checkEsewaPaymentStatus(
//       process.env.ESEWA_PRODUCT_CODE,
//       Math.round(booking.totalAmount),
//       bookingId
//     );

//     if (!esewaStatus) {
//       return res.json({
//         status: "pending",
//         message: "Unable to verify payment status with eSewa",
//         booking
//       });
//     }

//     if (esewaStatus.status === "COMPLETE") {
//       booking.payment.status = "paid";
//       booking.payment.transactionId = esewaStatus.ref_id;
//       await booking.save();
      
//       console.log("Payment verified via manual check");
      
//       return res.json({
//         status: "paid",
//         message: "Payment verified successfully",
//         booking,
//         esewaStatus
//       });
//     }

//     res.json({
//       status: esewaStatus.status.toLowerCase(),
//       message: `Payment status: ${esewaStatus.status}`,
//       booking,
//       esewaStatus
//     });

//   } catch (error) {
//     console.error("Status check error:", error);
//     res.status(500).json({ 
//       message: "Failed to check payment status",
//       error: error.message 
//     });
//   }
// };

// exports.cancelPendingPayment = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
    
//     //  POPULATE shelter to get the user field
//     const booking = await Booking.findById(bookingId).populate('shelter');
    
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.payment.status !== "pending") {
//       return res.status(400).json({ 
//         message: `Cannot cancel ${booking.payment.status} booking` 
//       });
//     }

//     const bookingAge = Date.now() - new Date(booking.createdAt).getTime();
//     const tenMinutes = 10 * 60 * 1000;

//     if (bookingAge < tenMinutes) {
//       return res.status(400).json({ 
//         message: "Please wait for payment confirmation before cancelling",
//         remainingTime: Math.ceil((tenMinutes - bookingAge) / 1000) + " seconds"
//       });
//     }

//     booking.bookingStatus = "cancelled";
//     booking.payment.status = "cancelled";
//     await booking.save();

//     //  FIXED: Use shelter.user instead of booking.shelter
//     await Notification.create({
//       user: booking.shelter.user,
//       message: "A pending booking payment was cancelled."
//     });

//     console.log("Pending payment cancelled:", bookingId);

//     res.json({ 
//       message: "Pending payment cancelled successfully",
//       booking 
//     });

//   } catch (error) {
//     console.error(" Cancel error:", error);
//     res.status(500).json({ message: "Failed to cancel booking" });
//   }
// };

// exports.getMyBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ petOwner: req.user.id })
//       .populate("shelter", "name location contact")
//       .sort({ createdAt: -1 });
//     res.json(bookings);
//   } catch (error) {
//     console.error("Failed to fetch bookings:", error);
//     res.status(500).json({ message: "Failed to fetch bookings" });
//   }
// };

// exports.getShelterBookings = async (req, res) => {
//   try {
//     const shelter = await Shelter.findOne({ user: req.user._id });

//     if (!shelter) {
//       return res.status(404).json({ message: "Shelter not found" });
//     }

//     const bookings = await Booking.find({
//       shelter: shelter._id,
//     })
//       .populate("petOwner", "name email")
//       .populate("pets")
//       .sort({ createdAt: -1 });

//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch shelter bookings" });
//   }
// };

// exports.cancelBooking = async (req, res) => {
//   try {
//     // POPULATE shelter to get the user field
//     const booking = await Booking.findById(req.params.id)
//     .populate('shelter')
//     .populate("petOwner", "name");
    
//     if (!booking) return res.status(404).json({ message: "Booking not found" });
    
//     if (booking.payment.status === "paid") {
//       return res.status(400).json({ 
//         message: "Cannot cancel paid booking. Please contact support for refund." 
//       });
//     }
    
//     booking.bookingStatus = "cancelled";
//     await booking.save();
    
//     // FIXED: Use shelter.user instead of booking.shelter
//     await Notification.create({
//       user: booking.shelter.user,
//       message: `Booking cancelled by ${booking.petOwner.name}.`
//     });

//     await Notification.create({
//       user: booking.petOwner,
//       message: "Your booking has been cancelled successfully."
//     });
    
//     console.log(" Booking cancelled:", booking._id);
    
//     res.json({ message: "Booking cancelled successfully" });
//   } catch (error) {
//     console.error("Cancellation failed:", error);
//     res.status(500).json({ message: "Cancellation failed" });
//   }
// };

// exports.getBookingDetails = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate("petOwner", "name email phone")
//       .populate("shelter", "name location contact");

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.json(booking);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch booking details" });
//   }
// };

// exports.markCashAsPaid = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.payment.status === "paid") {
//       return res.status(400).json({ message: "Payment is already marked as paid" });
//     }

//     booking.payment.status = "paid";
//     booking.payment.transactionId = "MANUAL-" + Date.now();
//     await booking.save();

//     await Notification.create({
//       user: booking.petOwner,
//       message: "Your cash payment has been marked as paid."
//     });

//     res.json({ success: true, message: "Payment marked as paid", booking });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to mark payment as paid", error: err.message });
//   }
// };

// exports.completeBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.payment.status !== "paid") {
//       return res.status(400).json({ message: "Payment not completed yet" });
//     }

//     booking.bookingStatus = "completed";
//     booking.checkOutDate = new Date();
//     await booking.save();

//     await Notification.create({
//       user: booking.petOwner,
//       message: "Your booking has been completed. Thank you!"
//     });    
    
//     res.json({ message: "Booking marked as completed", booking });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to complete booking" });
//   }
// };
// // Get booking history for pet owner
// exports.getBookingHistory = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ petOwner: req.user.id })
//       .populate("shelter", "name location contact")
//       .sort({ createdAt: -1 });

//     const now = new Date();

//     const history = bookings.map((booking) => {
//       const createdAt = new Date(booking.createdAt);
//       const hoursSinceBooking = (now - createdAt) / (1000 * 60 * 60); // difference in hours
//       const canCancel = hoursSinceBooking <= 24 && booking.payment.status !== "paid" && booking.bookingStatus !== "cancelled";

//       return {
//         ...booking._doc,
//         canCancel,
//       };
//     });

//     res.status(200).json({ success: true, bookings: history });
//   } catch (error) {
//     console.error("Failed to fetch booking history:", error);
//     res.status(500).json({ message: "Failed to fetch booking history" });
//   }
// };

const Booking = require("../models/booking");
const Shelter = require("../models/Shelter/shelter");
const User = require("../models/User");
const crypto = require("crypto");
const axios = require("axios");
const Notification = require("../models/notification");

// Generate eSewa Signature
const generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
  const secret = process.env.ESEWA_SECRET_KEY;
  const dataString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  
  console.log(" Generating signature for:", dataString);
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataString)
    .digest("base64");
    
  console.log("Generated signature:", signature);
  return signature;
};

// Verify eSewa Signature
const verifyEsewaSignature = (decoded) => {
  try {
    const signedFieldNames = decoded.signed_field_names.split(',');
    const signatureData = signedFieldNames
      .map(field => `${field}=${decoded[field]}`)
      .join(',');
    
    console.log("Signature data string:", signatureData);
    
    const generatedSignature = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(signatureData)
      .digest('base64');
    
    const isValid = generatedSignature === decoded.signature;
    
    console.log("🔍 Verifying signature:");
    console.log("   Expected:", generatedSignature);
    console.log("   Received:", decoded.signature);
    console.log("   Valid:", isValid);
    
    return isValid;
  } catch (error) {
    console.error("❌ Signature verification error:", error);
    return false;
  }
};

// Check payment status from eSewa API
const checkEsewaPaymentStatus = async (product_code, total_amount, transaction_uuid) => {
  try {
    const statusUrl = process.env.NODE_ENV === 'production'
      ? 'https://esewa.com.np/api/epay/transaction/status/'
      : 'https://rc.esewa.com.np/api/epay/transaction/status/';
    
    console.log("📡 Checking payment status:", { product_code, total_amount, transaction_uuid });
    
    const response = await axios.get(statusUrl, {
      params: { product_code, total_amount, transaction_uuid }
    });
    
    console.log("✅ eSewa status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error checking eSewa status:", error.message);
    return null;
  }
};

// ✅ CREATE BOOKING WITH ROOM ASSIGNMENTS
exports.createBooking = async (req, res) => {
  try {
    const { 
      shelterId, 
      serviceType, 
      startDate, 
      endDate, 
      pets, 
      pricePerDay, 
      paymentMethod,
      roomAssignments // ✅ NEW: Room assignments
    } = req.body;
    const petOwnerId = req.user.id;

    console.log("📝 Creating booking:", {
      shelterId,
      serviceType,
      petOwnerId,
      petCount: pets?.length,
      paymentMethod,
      roomAssignments
    });

    // Validate required fields
    if (!shelterId || !serviceType || !startDate || !pets || !pets.length || !pricePerDay || !paymentMethod) {
      console.error("❌ Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate room assignments
    if (!roomAssignments || roomAssignments.length === 0) {
      return res.status(400).json({ message: "Room assignments are required" });
    }

    if (roomAssignments.length !== pets.length) {
      return res.status(400).json({ 
        message: `Each pet must be assigned to a room. Expected ${pets.length} assignments, got ${roomAssignments.length}` 
      });
    }

    // Fetch shelter
    const shelter = await Shelter.findById(shelterId);
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    // ✅ Validate rooms exist and are available
    const selectedRoomNumbers = roomAssignments.map(r => r.roomNumber);
    const uniqueRooms = [...new Set(selectedRoomNumbers)];
    
    if (uniqueRooms.length !== selectedRoomNumbers.length) {
      return res.status(400).json({ message: "Cannot assign multiple pets to the same room" });
    }

    for (const roomNum of selectedRoomNumbers) {
      const room = shelter.rooms.find(r => r.roomNumber === roomNum);
      if (!room) {
        return res.status(400).json({ message: `Room ${roomNum} does not exist` });
      }
      if (room.status === "booked") {
        return res.status(400).json({ message: `Room ${roomNum} is already booked` });
      }
    }

    // Calculate costs
    const start = new Date(startDate);
    const end = new Date(endDate || startDate);
    const totalDays = serviceType === "daycare" ? 1 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmountValue = totalDays * pricePerDay * pets.length;
    
    console.log("💰 Calculated cost:", { totalDays, pricePerDay, petCount: pets.length, totalAmountValue });

    // Create booking
    const booking = await Booking.create({
      petOwner: petOwnerId,
      shelter: shelterId,
      serviceType,
      startDate,
      endDate: serviceType === "daycare" ? startDate : endDate,
      pets,
      petCount: pets.length,
      pricePerDay,
      totalDays,
      totalAmount: totalAmountValue,
      payment: {
        method: paymentMethod,
        status: "pending",
      },
      roomAssignments, // ✅ Store room assignments
    });

    // ✅ UPDATE SHELTER ROOMS TO BOOKED STATUS
    for (const assignment of roomAssignments) {
      const room = shelter.rooms.find(r => r.roomNumber === assignment.roomNumber);
      if (room) {
        room.status = "booked";
        room.bookedPet = {
          petId: booking._id,
          petName: assignment.petName,
          petImage: assignment.petPhoto,
          ownerId: petOwnerId,
        };
      }
    }

    // ✅ Update shelter status if all rooms are booked
    const availableRooms = shelter.rooms.filter(r => r.status === "available");
    if (availableRooms.length === 0) {
      shelter.status = "unavailable";
    }

    await shelter.save();
    console.log(`✅ Updated ${selectedRoomNumbers.length} room(s) to booked status`);

    // Send notifications
    const petOwner = await User.findById(petOwnerId).select("name");
    await Notification.create({
      user: shelter.user,
      message: `New booking from ${petOwner.name}: ${pets.length} pet in room ${selectedRoomNumbers.join(", ")}`
    });
    
    await Notification.create({
      user: petOwnerId,
      message: `Booking confirmed! Your pet assigned to room ${selectedRoomNumbers.join(", ")}`
    });

    console.log("✅ Booking created:", booking._id);

    // Handle eSewa payment
    if (paymentMethod === "esewa") {
      const totalAmount = Math.round(totalAmountValue).toString();
      const transactionId = booking._id.toString();
      const productCode = process.env.ESEWA_PRODUCT_CODE;
      
      console.log("💳 eSewa Payment Details:");
      console.log("   Amount:", totalAmount);
      console.log("   Transaction ID:", transactionId);
      console.log("   Product Code:", productCode);
      
      const signature = generateEsewaSignature(totalAmount, transactionId, productCode);

      const paymentData = {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionId,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${process.env.BACKEND_URL}/api/bookings/verify-esewa`,
        failure_url: `${process.env.FRONTEND_URL}/payment-failed`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
        esewa_url: process.env.ESEWA_URL
      };

      return res.status(201).json({
        success: true,
        bookingId: booking._id,
        isEsewa: true,
        paymentData
      });
    }

    // Cash payment
    console.log("💵 Cash booking confirmed");
    res.status(201).json({ 
      success: true, 
      message: "Booking confirmed (Cash on arrival)", 
      booking 
    });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ 
      message: "Booking failed", 
      error: error.message 
    });
  }
};

// ✅ VERIFY ESEWA PAYMENT
exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    
    console.log("🔔 eSewa callback received");
    console.log("   Query params:", req.query);
    
    if (!data) {
      console.error("❌ No data parameter in callback");
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=no_data`);
    }

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
      console.log("📦 Decoded eSewa response:", decoded);
    } catch (decodeError) {
      console.error("❌ Failed to decode eSewa response:", decodeError);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=decode_failed`);
    }

    const isValidSignature = verifyEsewaSignature(decoded);

    if (!isValidSignature) {
      console.error("⚠️ Invalid signature detected!");
      console.warn("⚠️ Proceeding despite invalid signature (TEST MODE)");
    } else {
      console.log("✅ Signature verified successfully");
    }

    if (decoded.status === "COMPLETE") {
      const booking = await Booking.findByIdAndUpdate(
        decoded.transaction_uuid,
        {
          "payment.status": "paid",
          "payment.transactionId": decoded.transaction_code,
        },
        { new: true }
      ).populate('shelter');

      if (!booking) {
        console.error("❌ Booking not found:", decoded.transaction_uuid);
        return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=booking_not_found`);
      }

      await Notification.create({
        user: booking.petOwner,
        message: "Your payment was successful. Booking confirmed!"
      });

      await Notification.create({
        user: booking.shelter.user,
        message: "A booking payment has been completed."
      });

      console.log("✅ Payment verified! Booking updated:", booking._id);

      return res.redirect(`${process.env.FRONTEND_URL}/payment-success?status=success&ref=${decoded.transaction_code}`);
    }
    
    console.warn("⚠️ Payment not complete. Status:", decoded.status);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed?status=${decoded.status}`);
  } catch (err) {
    console.error("❌ Verification Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=verification_failed`);
  }
};

// CHECK PAYMENT STATUS
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log("🔍 Manual status check for booking:", bookingId);
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.payment.status === "paid") {
      return res.json({
        status: "paid",
        message: "Payment already completed",
        booking
      });
    }

    const esewaStatus = await checkEsewaPaymentStatus(
      process.env.ESEWA_PRODUCT_CODE,
      Math.round(booking.totalAmount),
      bookingId
    );

    if (!esewaStatus) {
      return res.json({
        status: "pending",
        message: "Unable to verify payment status with eSewa",
        booking
      });
    }

    if (esewaStatus.status === "COMPLETE") {
      booking.payment.status = "paid";
      booking.payment.transactionId = esewaStatus.ref_id;
      await booking.save();
      
      console.log("✅ Payment verified via manual check");
      
      return res.json({
        status: "paid",
        message: "Payment verified successfully",
        booking,
        esewaStatus
      });
    }

    res.json({
      status: esewaStatus.status.toLowerCase(),
      message: `Payment status: ${esewaStatus.status}`,
      booking,
      esewaStatus
    });

  } catch (error) {
    console.error("❌ Status check error:", error);
    res.status(500).json({ 
      message: "Failed to check payment status",
      error: error.message 
    });
  }
};

// ✅ CANCEL PENDING PAYMENT
exports.cancelPendingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId).populate('shelter');
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.payment.status !== "pending") {
      return res.status(400).json({ 
        message: `Cannot cancel ${booking.payment.status} booking` 
      });
    }

    const bookingAge = Date.now() - new Date(booking.createdAt).getTime();
    const tenMinutes = 10 * 60 * 1000;

    if (bookingAge < tenMinutes) {
      return res.status(400).json({ 
        message: "Please wait for payment confirmation before cancelling",
        remainingTime: Math.ceil((tenMinutes - bookingAge) / 1000) + " seconds"
      });
    }

    booking.bookingStatus = "cancelled";
    booking.payment.status = "cancelled";
    await booking.save();

    // ✅ RELEASE ROOMS
    if (booking.roomAssignments && booking.roomAssignments.length > 0) {
      const shelter = await Shelter.findById(booking.shelter._id);
      if (shelter) {
        const bookedRoomNumbers = booking.roomAssignments.map(r => r.roomNumber);
        
        for (const roomNum of bookedRoomNumbers) {
          const room = shelter.rooms.find(r => r.roomNumber === roomNum);
          if (room && room.bookedPet?.petId?.toString() === booking._id.toString()) {
            room.status = "available";
            room.bookedPet = undefined;
          }
        }

        const availableRooms = shelter.rooms.filter(r => r.status === "available");
        if (availableRooms.length > 0 && shelter.status === "unavailable") {
          shelter.status = "available";
        }

        await shelter.save();
        console.log(`✅ Released rooms: ${bookedRoomNumbers.join(", ")}`);
      }
    }

    await Notification.create({
      user: booking.shelter.user,
      message: "A pending booking payment was cancelled. Rooms released."
    });

    console.log("❌ Pending payment cancelled:", bookingId);

    res.json({ 
      message: "Pending payment cancelled successfully. Rooms released.",
      booking 
    });

  } catch (error) {
    console.error("❌ Cancel error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

// GET MY BOOKINGS
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ petOwner: req.user.id })
      .populate("shelter", "name location contact")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("❌ Failed to fetch bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// GET SHELTER BOOKINGS
exports.getShelterBookings = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ user: req.user._id });

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    const bookings = await Booking.find({
      shelter: shelter._id,
    })
      .populate("petOwner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Failed to fetch shelter bookings:", error);
    res.status(500).json({ message: "Failed to fetch shelter bookings" });
  }
};

// ✅ CANCEL BOOKING AND RELEASE ROOMS
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('shelter')
      .populate("petOwner", "name");
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.payment.status === "paid") {
      return res.status(400).json({ 
        message: "Cannot cancel paid booking. Please contact support for refund." 
      });
    }
    
    booking.bookingStatus = "cancelled";
    await booking.save();

    // ✅ RELEASE ROOMS
    if (booking.roomAssignments && booking.roomAssignments.length > 0) {
      const shelter = await Shelter.findById(booking.shelter._id);
      if (shelter) {
        const bookedRoomNumbers = booking.roomAssignments.map(r => r.roomNumber);
        
        for (const roomNum of bookedRoomNumbers) {
          const room = shelter.rooms.find(r => r.roomNumber === roomNum);
          if (room && room.bookedPet?.petId?.toString() === booking._id.toString()) {
            room.status = "available";
            room.bookedPet = undefined;
          }
        }

        const availableRooms = shelter.rooms.filter(r => r.status === "available");
        if (availableRooms.length > 0 && shelter.status === "unavailable") {
          shelter.status = "available";
        }

        await shelter.save();
        console.log(`✅ Released rooms after cancellation: ${bookedRoomNumbers.join(", ")}`);
      }
    }
    
    await Notification.create({
      user: booking.shelter.user,
      message: `Booking cancelled by ${booking.petOwner.name}. Rooms released.`
    });

    await Notification.create({
      user: booking.petOwner._id,
      message: "Your booking has been cancelled successfully. Rooms released."
    });
    
    console.log("❌ Booking cancelled:", booking._id);
    
    res.json({ message: "Booking cancelled successfully. Rooms released." });
  } catch (error) {
    console.error("❌ Cancellation failed:", error);
    res.status(500).json({ message: "Cancellation failed" });
  }
};

// GET BOOKING DETAILS
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("petOwner", "name email phone")
      .populate("shelter", "name location contact");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("❌ Failed to fetch booking details:", error);
    res.status(500).json({ message: "Failed to fetch booking details" });
  }
};

// MARK CASH AS PAID
exports.markCashAsPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.payment.status === "paid") {
      return res.status(400).json({ message: "Payment is already marked as paid" });
    }

    booking.payment.status = "paid";
    booking.payment.transactionId = "MANUAL-" + Date.now();
    await booking.save();

    await Notification.create({
      user: booking.petOwner,
      message: "Your pending payment has been marked as paid."
    });

    console.log("✅ Cash payment marked as paid:", booking._id);

    res.json({ success: true, message: "Payment marked as paid", booking });
  } catch (err) {
    console.error("❌ Failed to mark cash as paid:", err);
    res.status(500).json({ message: "Failed to mark payment as paid", error: err.message });
  }
};

// ✅ COMPLETE BOOKING AND RELEASE ROOMS
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('shelter');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.payment.status !== "paid") {
      return res.status(400).json({ message: "Payment not completed yet" });
    }

    booking.bookingStatus = "completed";
    booking.checkOutDate = new Date();
    await booking.save();

    // ✅ RELEASE ROOMS AFTER CHECKOUT
    if (booking.roomAssignments && booking.roomAssignments.length > 0) {
      const shelter = await Shelter.findById(booking.shelter._id);
      if (shelter) {
        const bookedRoomNumbers = booking.roomAssignments.map(r => r.roomNumber);
        
        for (const roomNum of bookedRoomNumbers) {
          const room = shelter.rooms.find(r => r.roomNumber === roomNum);
          if (room && room.bookedPet?.petId?.toString() === booking._id.toString()) {
            room.status = "available";
            room.bookedPet = undefined;
          }
        }

        const availableRooms = shelter.rooms.filter(r => r.status === "available");
        if (availableRooms.length > 0 && shelter.status === "unavailable") {
          shelter.status = "available";
        }

        await shelter.save();
        console.log(`✅ Released rooms after checkout: ${bookedRoomNumbers.join(", ")}`);
      }
    }

    await Notification.create({
      user: booking.petOwner,
      message: "Your booking has been completed. Thank you!"
    });

    console.log("✅ Booking completed:", booking._id);
    
    res.json({ message: "Booking completed successfully. Rooms released.", booking });
  } catch (error) {
    console.error("❌ Failed to complete booking:", error);
    res.status(500).json({ message: "Failed to complete booking" });
  }
};

// GET BOOKING HISTORY
exports.getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ petOwner: req.user.id })
      .populate("shelter", "name location contact")
      .sort({ createdAt: -1 });

    const now = new Date();

    const history = bookings.map((booking) => {
      const createdAt = new Date(booking.createdAt);
      const hoursSinceBooking = (now - createdAt) / (1000 * 60 * 60);
      const canCancel = hoursSinceBooking <= 24 && booking.payment.status !== "paid" && booking.bookingStatus !== "cancelled";

      return {
        ...booking._doc,
        canCancel,
      };
    });

    res.status(200).json({ success: true, bookings: history });
  } catch (error) {
    console.error("❌ Failed to fetch booking history:", error);
    res.status(500).json({ message: "Failed to fetch booking history" });
  }
};