const mongoose = require("mongoose");

 const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);
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
    contact: { type: String, required: true },
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
    // Add reviews here
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Shelter", shelterSchema);
