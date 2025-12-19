// const Pet = require("../models/petProfile");
// const User = require("../models/User");

// /**
//  * CREATE PET PROFILE
//  * increments user.petCount
//  */
// exports.createPet = async (req, res) => {
//   try {
//     const pet = await Pet.create({
//       ...req.body,
//       owner: req.user._id,
//       photo: req.file ? req.file.filename : null,
//     });

//     // increment pet count
//     req.user.petCount += 1;
//     await req.user.save();

//     res.status(201).json({
//       message: "Pet profile created",
//       pet,
//       petCount: req.user.petCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * GET ALL PETS FOR LOGGED-IN USER
//  */
// exports.getMyPets = async (req, res) => {
//   try {
//     const pets = await Pet.find({ owner: req.user._id });
//     res.json(pets);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * GET SINGLE PET
//  */
// exports.getPetById = async (req, res) => {
//   try {
//     const pet = await Pet.findOne({
//       _id: req.params.id,
//       owner: req.user._id,
//     });

//     if (!pet) {
//       return res.status(404).json({ message: "Pet not found" });
//     }

//     res.json(pet);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * UPDATE PET
//  * does NOT change petCount
//  */
// exports.updatePet = async (req, res) => {
//   try {
//     const updatedData = { ...req.body };

//     if (req.file) {
//       updatedData.photo = req.file.filename;
//     }

//     const pet = await Pet.findOneAndUpdate(
//       { _id: req.params.id, owner: req.user._id },
//       updatedData,
//       { new: true }
//     );

//     if (!pet) {
//       return res.status(404).json({ message: "Pet not found" });
//     }

//     res.json({
//       message: "Pet profile updated",
//       pet,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * DELETE PET PROFILE
//  * decrements user.petCount
//  */
// exports.deletePet = async (req, res) => {
//   try {
//     const pet = await Pet.findOneAndDelete({
//       _id: req.params.id,
//       owner: req.user._id,
//     });

//     if (!pet) {
//       return res.status(404).json({ message: "Pet not found" });
//     }

//     // decrement pet count safely
//     if (req.user.petCount > 0) {
//       req.user.petCount -= 1;
//       await req.user.save();
//     }

//     res.json({
//       message: "Pet profile deleted",
//       petCount: req.user.petCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const User = require("../models/User");

/**
 * CREATE PET PROFILE
 */
exports.createPet = async (req, res) => {
  try {
    // Make sure pets array exists
    if (!req.user.pets) req.user.pets = [];

    const newPet = {
      ...req.body,
      photo: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    req.user.pets.push(newPet);
    req.user.petCount = req.user.pets.length;

    await req.user.save();

    res.status(201).json({
      message: "Pet profile created",
      pets: req.user.pets,
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
exports.updatePet = async (req, res) => {
  try {
    const pet = req.user.pets.id(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Update fields
    Object.assign(pet, req.body);

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
