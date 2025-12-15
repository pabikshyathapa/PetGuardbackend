// const Shelter = require("../../models/Shelter/shelter");

// // CREATE OR UPDATE SHELTER
// exports.createOrUpdateShelter = async (req, res) => {
//   try {
//     const { name, location, description, services, status, pricePerDay } = req.body;

//     // Photos & documents
//     const photos = req.files?.photos?.map((f) => f.filename) || [];
//     const documents = req.files?.documents?.map((f) => f.filename) || [];

//      // Parse removed files
//     const removedPhotos = req.body.removedPhotos ? JSON.parse(req.body.removedPhotos) : [];
//     const removedDocuments = req.body.removedDocuments ? JSON.parse(req.body.removedDocuments) : [];

//     // Prepare data
//     const shelterData = {
//       user: req.user._id,
//       name,
//       location,
//       description,
//       services: services ? services.split(",") : [],
//       status: status?.toLowerCase(),
//       pricePerDay,
//     };

//     // Find existing shelter
//     let shelter = await Shelter.findOne({ user: req.user._id });

//     if (shelter) {
//       // Update fields
//       Object.assign(shelter, shelterData);

//       // Remove deleted files from MongoDB arrays
//       shelter.photos = shelter.photos.filter((p) => !removedPhotosArr.includes(p));
//       shelter.documents = shelter.documents.filter((d) => !removedDocumentsArr.includes(d));

//       // Append new files if any
//       if (photos.length) shelter.photos.push(...photos);
//       if (documents.length) shelter.documents.push(...documents);

//       await shelter.save();
//       return res.status(200).json({ success: true, message: "Shelter updated successfully", shelter });
//     } else {
//       // Create new
//       shelter = new Shelter({
//         ...shelterData,
//         photos,
//         documents,
//       });
//       await shelter.save();
//       return res.status(201).json({ success: true, message: "Shelter created successfully", shelter });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Shelter save failed", error: error.message });
//   }
// };

const Shelter = require("../../models/Shelter/shelter");

// CREATE OR UPDATE SHELTER
exports.createOrUpdateShelter = async (req, res) => {
  try {
    const { name, location, description, services, status, pricePerDay } = req.body;

    // Photos & documents uploaded now
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

      await shelter.save();
      return res.status(200).json({ success: true, message: "Shelter updated successfully", shelter });
    } else {
      // Create new
      shelter = new Shelter({
        ...shelterData,
        photos: newPhotos,
        documents: newDocuments,
      });
      await shelter.save();
      return res.status(201).json({ success: true, message: "Shelter created successfully", shelter });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Shelter save failed", error: error.message });
  }
};


// GET SHELTER OF LOGGED IN USER
exports.getMyShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ user: req.user._id });
    res.json(shelter);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shelter" });
  }
};

// GET ALL AVAILABLE SHELTERS
exports.getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find({ status: "available" }).populate("user", "name");
    res.json(shelters);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shelters" });
  }
};

