const Shelter = require("../../models/Shelter/shelter");

// CREATE OR UPDATE SHELTER
exports.createOrUpdateShelter = async (req, res) => {
  try {
    const { name, location, contact, description, services, status, pricePerDay } = req.body;

    // Photos & documents uploaded
    const newPhotos = req.files?.photos?.map((f) => f.filename) || [];
    const newDocuments = req.files?.documents?.map((f) => f.filename) || [];

    // Parse removed files
    const removedPhotosArr = req.body.removedPhotos ? JSON.parse(req.body.removedPhotos) : [];
    const removedDocumentsArr = req.body.removedDocuments ? JSON.parse(req.body.removedDocuments) : [];

    // Prepare shelter data
    const shelterData = {
      user: req.user._id,
      name,
      location,
      contact,
      description,
      services: services ? services.split(",") : [],
      status: status?.toLowerCase(),
      pricePerDay,
    };

    // Find existing shelter
    let shelter = await Shelter.findOne({ user: req.user._id });

    if (shelter) {
      // Update fields
      Object.assign(shelter, shelterData);

      // Remove files marked for deletion
      shelter.photos = shelter.photos.filter((p) => !removedPhotosArr.includes(p));
      shelter.documents = shelter.documents.filter((d) => !removedDocumentsArr.includes(d));

      // Add newly uploaded files
      shelter.photos.push(...newPhotos);
      shelter.documents.push(...newDocuments);

      // Ensure reviews array exists
      shelter.reviews = shelter.reviews || [];
      shelter.reviewCount = shelter.reviewCount || 0;
      shelter.averageRating = shelter.averageRating || 0;

      await shelter.save();
      return res.status(200).json({ success: true, message: "Shelter updated successfully", shelter });
    } else {
      // Create new shelter
      shelter = new Shelter({
        ...shelterData,
        photos: newPhotos,
        documents: newDocuments,
        reviews: [],
        reviewCount: 0,
        averageRating: 0,
      });

      await shelter.save();
      return res.status(201).json({ success: true, message: "Shelter created successfully", shelter });
    }
  } catch (error) {
    console.error("Shelter save error:", error);
    res.status(500).json({ message: "Shelter save failed", error: error.message });
  }
};

// GET SHELTER OF LOGGED IN USER
exports.getMyShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ user: req.user._id });
    res.json(shelter);
  } catch (error) {
    console.error("Fetch my shelter error:", error);
    res.status(500).json({ message: "Failed to fetch shelter" });
  }
};

// GET ALL SHELTERS
exports.getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find();
    res.json(shelters);
  } catch (error) {
    console.error("Fetch all shelters error:", error);
    res.status(500).json({ message: "Failed to fetch shelters" });
  }
};

// GET SHELTER BY ID
exports.getShelterById = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }
    res.json(shelter);
  } catch (err) {
    console.error("Fetch shelter by ID error:", err);
    res.status(500).json({ message: "Shelter fetch failed", error: err.message });
  }
};
