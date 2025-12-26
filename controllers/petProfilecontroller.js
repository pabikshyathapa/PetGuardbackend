const User = require("../models/User");

/**
 * CREATE PET PROFILE
 */
// exports.createPet = async (req, res) => {
//   try {
//     // Make sure pets array exists
//     if (!req.user.pets) req.user.pets = [];

//     const newPet = {
//       ...req.body,
//       photo: req.file ? req.file.filename : null,
//       createdAt: new Date(),
//     };

//     req.user.pets.push(newPet);
//     req.user.petCount = req.user.pets.length;

//     await req.user.save();

//     res.status(201).json({
//       message: "Pet profile created",
//       pets: req.user.pets,
//       petCount: req.user.petCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.createPet = async (req, res) => {
  try {
    if (!req.user.pets) req.user.pets = [];

    // Parse emergencyContact if sent as JSON string
    let emergencyContact = null;
    if (req.body.emergencyContact) {
      try {
        emergencyContact = JSON.parse(req.body.emergencyContact);
      } catch {
        emergencyContact = req.body.emergencyContact;
      }
    }

    const newPet = {
      ...req.body,
      emergencyContact, // set the parsed object here
      photo: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    req.user.pets.push(newPet);
    req.user.petCount = req.user.pets.length;

    await req.user.save();

    res.status(201).json({
      message: "Pet profile created",
      pet: newPet, // return the newly created pet
      petCount: req.user.petCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL PETS
 */
exports.getMyPets = async (req, res) => {
  try {
    res.json(req.user.pets || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE PET
 */
exports.getPetById = async (req, res) => {
  try {
    const pet = req.user.pets.id(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE PET
 */
// exports.updatePet = async (req, res) => {
//   try {
//     const pet = req.user.pets.id(req.params.id);
//     if (!pet) return res.status(404).json({ message: "Pet not found" });

//     // Update fields
//     Object.assign(pet, req.body);

//     // Update photo if uploaded
//     if (req.file) pet.photo = req.file.filename;

//     await req.user.save();

//     res.json({ message: "Pet profile updated", pet });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.updatePet = async (req, res) => {
  try {
    const pet = req.user.pets.id(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Handle emergencyContact if sent as JSON string
    if (req.body.emergencyContact) {
      try {
        pet.emergencyContact = JSON.parse(req.body.emergencyContact);
      } catch {
        pet.emergencyContact = req.body.emergencyContact;
      }
    }

    // Update other fields
    const fieldsToUpdate = { ...req.body };
    delete fieldsToUpdate.emergencyContact; // already handled
    delete fieldsToUpdate.photo; // photo handled separately
    Object.assign(pet, fieldsToUpdate);

    // Update photo if uploaded
    if (req.file) pet.photo = req.file.filename;

    await req.user.save();

    res.json({ message: "Pet profile updated", pet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE PET
 */
exports.deletePet = async (req, res) => {
  try {
    const pet = req.user.pets.id(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    pet.remove(); // remove pet from array
    req.user.petCount = req.user.pets.length;

    await req.user.save();

    res.json({ message: "Pet profile deleted", petCount: req.user.petCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
