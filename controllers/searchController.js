const Shelter = require("../models/Shelter/shelter");

exports.searchShelters = async (req, res) => {
  try {
    const {
      name,
      location,
      petType,
      petCount,
      startDate,
      endDate,
      searchType, // "boarding" or "daycare"
    } = req.query;

    let query = {
      status: "available", // only show available shelters
    };
     if (name) {
      query.name = { $regex: name, $options: "i" }; // case-insensitive match
    }

    // Location filter (optional)
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Pet type filter (optional)
    if (petType) {
      query.services = { $in: [petType] }; // optional if you store pet types
    }

    // Service filter based on search type
    if (searchType === "boarding") {
      query.services = { $in: ["boarding", "both"] };
      // Boarding has from-to date
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "From and To dates required for boarding" });
      }
    } else if (searchType === "daycare") {
      query.services = { $in: ["daycare", "both"] };
      if (!startDate) {
        return res.status(400).json({ message: "Date required for daycare" });
      }
    } else {
      return res.status(400).json({ message: "Invalid search type" });
    }

    const shelters = await Shelter.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      count: shelters.length,
      filters: {
        name,
        location,
        petType,
        petCount,
        startDate,
        endDate,
        searchType,
      },
      shelters,
    });
  } catch (error) {
    console.error("Shelter search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
