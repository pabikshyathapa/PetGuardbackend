const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
