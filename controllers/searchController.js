const Shelter = require("../models/Shelter/shelter");

exports.searchShelters = async (req, res) => {
  try {
    const { name, location, minPrice, maxPrice, service } = req.query;

    let query = {};

    if (name) {
      query.name = { $regex: name.trim(), $options: "i" };
    }

    if (location) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    if (service) {
      const servicesArray = service.split(",").map((s) => s.trim());
      query.services = { $in: servicesArray };
    }

    const shelters = await Shelter.find(query)
      .sort({ averageRating: -1 })
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      count: shelters.length,
      data: shelters,
    });
  } catch (error) {
    console.error("Search shelters error:", error);
    res.status(500).json({
      success: false,
      message: "Shelter fetch failed",
      error: error.message,
    });
  }
};