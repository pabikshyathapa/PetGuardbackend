// const mongoose = require("mongoose");

// const bookedPetSchema = new mongoose.Schema(
//   {
//     petName: { type: String, required: true },
//     location: String,
//     type: { type: String, required: true },
//     breed: String,
//     gender: String,
//     age: Number,
//     weight: Number,
//     health: String,
//     characteristics: [String],
//     emergencyContact: {
//       name: String,
//       phone: String,
//     },
//     photo: String,
//   },
//   { _id: false }
// );

// const bookingSchema = new mongoose.Schema(
//   {
//     petOwner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     shelter: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Shelter",
//       required: true,
//     },

//     serviceType: {
//       type: String,
//       enum: ["boarding", "daycare"],
//       required: true,
//     },

//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },

//     pets: {
//       type: [bookedPetSchema],
//       required: true,
//     },

//     petCount: { type: Number, required: true },

//     pricePerDay: { type: Number, required: true },
//     totalDays: { type: Number, required: true },
//     totalAmount: { type: Number, required: true },

//     bookingStatus: {
//       type: String,
//       enum: ["confirmed", "cancelled"],
//       default: "confirmed",
//     },

//     payment: {
//       method: {
//         type: String,
//         enum: ["esewa", "cash"],
//         required: true,
//       },
//       status: {
//         type: String,
//         enum: ["paid", "pending"],
//         required: true,
//       },
//       transactionId: String,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Booking", bookingSchema);

const mongoose = require("mongoose");

const bookedPetSchema = new mongoose.Schema(
  {
    petName: { type: String, required: true },
    location: String,
    type: { type: String, required: true },
    breed: String,
    gender: String,
    age: Number,
    weight: Number,
    health: String,
    characteristics: [String],
    emergencyContact: {
      name: String,
      phone: String,
    },
    photo: String,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    petOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["boarding", "daycare"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pets: {
      type: [bookedPetSchema],
      required: true,
    },
    petCount: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "confirmed",
    },
    payment: {
      method: {
        type: String,
        enum: ["esewa", "cash"],
        required: true,
      },
      status: {
        type: String,
        enum: ["paid", "pending", "cancelled"],
        required: true,
      },
      transactionId: String,
      paidAt: Date,
    },
    // Service completion tracking
    checkInDate: Date,
    checkOutDate: Date,
    shelterNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);