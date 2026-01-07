// const Shelter = require("../../models/Shelter/shelter");

// // CREATE/UPDATE SHELTER
// exports.createOrUpdateShelter = async (req, res) => {
//   try {
//     const { name, location, contact, description, services, status, pricePerDay } = req.body;

//     const newPhotos = req.files?.photos?.map((f) => f.filename) || [];
//     const newDocuments = req.files?.documents?.map((f) => f.filename) || [];

//     const removedPhotosArr = req.body.removedPhotos ? JSON.parse(req.body.removedPhotos) : [];
//     const removedDocumentsArr = req.body.removedDocuments ? JSON.parse(req.body.removedDocuments) : [];

//     const shelterData = {
//       user: req.user._id,
//       name,
//       location,
//       contact,
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

//       // Remove files marked for deletion
//       shelter.photos = shelter.photos.filter((p) => !removedPhotosArr.includes(p));
//       shelter.documents = shelter.documents.filter((d) => !removedDocumentsArr.includes(d));

//       shelter.photos.push(...newPhotos);
//       shelter.documents.push(...newDocuments);

//       shelter.reviews = shelter.reviews || [];
//       shelter.reviewCount = shelter.reviewCount || 0;
//       shelter.averageRating = shelter.averageRating || 0;

//       await shelter.save();
//       return res.status(200).json({ success: true, message: "Shelter updated successfully", shelter });
//     } else {
//       // Create new shelter
//       shelter = new Shelter({
//         ...shelterData,
//         photos: newPhotos,
//         documents: newDocuments,
//         reviews: [],
//         reviewCount: 0,
//         averageRating: 0,
//       });

//       await shelter.save();
//       return res.status(201).json({ success: true, message: "Shelter created successfully", shelter });
//     }
//   } catch (error) {
//     console.error("Shelter save error:", error);
//     res.status(500).json({ message: "Shelter save failed", error: error.message });
//   }
// };

// // GET SHELTER OF LOGGED IN USER
// exports.getMyShelter = async (req, res) => {
//   try {
//     const shelter = await Shelter.findOne({ user: req.user._id });
//     res.json(shelter);
//   } catch (error) {
//     console.error("Fetch my shelter error:", error);
//     res.status(500).json({ message: "Failed to fetch shelter" });
//   }
// };

// // GET ALL SHELTERS
// exports.getAllShelters = async (req, res) => {
//   try {
//     const shelters = await Shelter.find();
//     res.json(shelters);
//   } catch (error) {
//     console.error("Fetch all shelters error:", error);
//     res.status(500).json({ message: "Failed to fetch shelters" });
//   }
// };

// // GET SHELTER BY ID
// exports.getShelterById = async (req, res) => {
//   try {
//     const shelter = await Shelter.findById(req.params.id);
//     if (!shelter) {
//       return res.status(404).json({ message: "Shelter not found" });
//     }
//     res.json(shelter);
//   } catch (err) {
//     console.error("Fetch shelter by ID error:", err);
//     res.status(500).json({ message: "Shelter fetch failed", error: err.message });
//   }
// };

const Shelter = require("../../models/Shelter/shelter");

exports.createOrUpdateShelter = async (req, res) => {
  try {
    const {
      name,
      location,
      contact,
      description,
      services,
      status,
      pricePerDay,
      totalRooms,
    } = req.body;

    const newPhotos = req.files?.photos?.map((f) => f.filename) || [];
    const newDocuments = req.files?.documents?.map((f) => f.filename) || [];

    const removedPhotosArr = req.body.removedPhotos
      ? JSON.parse(req.body.removedPhotos)
      : [];
    const removedDocumentsArr = req.body.removedDocuments
      ? JSON.parse(req.body.removedDocuments)
      : [];

    const shelterData = {
      user: req.user._id,
      name,
      location,
      contact,
      description,
      services: services ? services.split(",") : [],
      pricePerDay,
    };

    let shelter = await Shelter.findOne({ user: req.user._id });

    /* ===============================
       UPDATE SHELTER
    ================================ */
    if (shelter) {
      Object.assign(shelter, shelterData);

      // Remove deleted files
      shelter.photos = shelter.photos.filter(
        (p) => !removedPhotosArr.includes(p)
      );
      shelter.documents = shelter.documents.filter(
        (d) => !removedDocumentsArr.includes(d)
      );

      shelter.photos.push(...newPhotos);
      shelter.documents.push(...newDocuments);

      // Safety defaults
      shelter.reviews = shelter.reviews || [];
      shelter.reviewCount = shelter.reviewCount || 0;
      shelter.averageRating = shelter.averageRating || 0;
      shelter.rooms = shelter.rooms || [];

      /* ===============================
         ROOM MANAGEMENT (EDIT MODE)
      ================================ */
      if (totalRooms !== undefined && totalRooms !== null && totalRooms !== "") {
        const requestedRooms = Number(totalRooms);
        const currentRooms = shelter.rooms.length;

        if (requestedRooms > currentRooms) {
          // Add new rooms
          const roomsToAdd = requestedRooms - currentRooms;
          for (let i = 0; i < roomsToAdd; i++) {
            shelter.rooms.push({
              roomNumber: shelter.rooms.length + 1,
              status: "available",
            });
          }
        } else if (requestedRooms < currentRooms) {
          // Remove rooms (only available ones, from the end)
          const roomsToRemove = currentRooms - requestedRooms;
          let removedCount = 0;
          
          for (let i = shelter.rooms.length - 1; i >= 0 && removedCount < roomsToRemove; i--) {
            if (shelter.rooms[i].status === "available") {
              shelter.rooms.splice(i, 1);
              removedCount++;
            }
          }
          
          // Renumber remaining rooms
          shelter.rooms.forEach((room, index) => {
            room.roomNumber = index + 1;
          });
        }
      }

      /* ===============================
         AUTO STATUS LOGIC
      ================================ */
      const total = shelter.rooms.length;
      const booked = shelter.rooms.filter(
        (r) => r.status === "booked"
      ).length;

      if (total > 0 && booked === total) {
        shelter.status = "unavailable";
      } else if (total > 0) {
        shelter.status = "available";
      } else {
        shelter.status = "unavailable";
      }

      await shelter.save();

      return res.status(200).json({
        success: true,
        message: "Shelter updated successfully",
        shelter,
      });
    }

    /* ===============================
       CREATE SHELTER
    ================================ */
    const rooms = totalRooms
      ? Array.from({ length: Number(totalRooms) }, (_, i) => ({
          roomNumber: i + 1,
          status: "available",
        }))
      : [];

    shelter = new Shelter({
      ...shelterData,
      photos: newPhotos,
      documents: newDocuments,
      rooms,
      status: rooms.length ? "available" : "unavailable",
      reviews: [],
      reviewCount: 0,
      averageRating: 0,
    });

    await shelter.save();

    return res.status(201).json({
      success: true,
      message: "Shelter created successfully",
      shelter,
    });
  } catch (error) {
    console.error("Shelter save error:", error);
    res.status(500).json({
      message: "Shelter save failed",
      error: error.message,
    });
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

exports.bookRoom = async (req, res) => {
  try {
    const { shelterId, roomNumber, petId } = req.body;

    const shelter = await Shelter.findById(shelterId);
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    const room = shelter.rooms.find(r => r.roomNumber === roomNumber);
    if (!room || room.status === "booked") {
      return res.status(400).json({ message: "Room not available" });
    }

    const pet = req.user.pets.id(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    room.status = "booked";
    room.bookedPet = {
      petId: pet._id,
      petName: pet.petName,
      petImage: pet.photo,
      ownerId: req.user._id,
    };

    await shelter.save();

    res.json({ message: "Room booked successfully", room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
