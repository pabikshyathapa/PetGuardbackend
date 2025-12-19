// const mongoose = require("mongoose");

// const petSchema = new mongoose.Schema(
//   {
//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     petName: {
//       type: String,
//       required: true,
//     },

//     location: String,

//     type: {
//       type: String,
//       required: true,
//     },

//     breed: String,

//     gender: {
//       type: String,
//       enum: ["Male", "Female"],
//     },

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
//   { timestamps: true }
// );

// module.exports = mongoose.model("Pet", petSchema);
