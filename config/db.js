const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const CONNECTION_STRING = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(CONNECTION_STRING); // No options required
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.log("DB Error:", err.message);
  }
};

module.exports = connectDB;
