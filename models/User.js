// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: { type: String, required: true },

//     phone: { type: String, required: true },

//     role: {
//       type: String,
//       enum: ["petowner", "shelter", "admin"],
//       required: true,
//     },
//   //    petCount: {
//   //   type: Number,
//   //   default: 0,
//   // },

//     filepath: { type: String },
//   },
//   { timestamps: true },
  
// );

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    phone: { type: String, required: true },

    role: {
      type: String,
      enum: ["petowner", "shelter", "admin"],
      required: true,
    },

    // number of pets
    petCount: { type: Number, default: 0 },

    // pets array stored inside user document
    pets: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        petName: { type: String, required: true },
        location: String,
        type: { type: String, required: true },
        breed: String,
        gender: { type: String, enum: ["Male", "Female"] },
        age: Number,
        weight: Number,
        health: String,
        characteristics: [String],
        emergencyContact: { name: String, phone: String },
        photo: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
     favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shelter",
      },
    ],

    filepath: { type: String },
  },
  { timestamps: true }

  
);



module.exports = mongoose.model("User", userSchema);
