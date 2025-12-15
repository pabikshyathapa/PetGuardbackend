const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },

    services: [{ type: String }],

    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },

    pricePerDay: { type: Number, required: true },

    photos: [{ type: String }],
    documents: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shelter", shelterSchema);
