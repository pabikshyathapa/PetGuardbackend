// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phone: { type: String, required: true },
//   role:{type:String,default:"normal"},
//  filepath: {type: String}


// });

// module.exports = mongoose.model('User', userSchema);
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

    filepath: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
