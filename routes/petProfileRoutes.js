// const express = require("express");
// const router = express.Router();

// const upload = require("../middlewares/upload");
// const { authenticateUser } = require("../middlewares/authorizedUser");

// const {
//   createPet,
//   getMyPets,
//   getPetById,
//   updatePet,
//   deletePet,
// } = require("../controllers/petProfilecontroller");

// router.post("/", authenticateUser, upload.single("photo"), createPet);
// router.get("/", authenticateUser, getMyPets);
// router.get("/:id", authenticateUser, getPetById);
// router.put("/:id", authenticateUser, upload.single("photo"), updatePet);
// router.delete("/:id", authenticateUser, deletePet);

// module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { authenticateUser } = require("../middlewares/authorizedUser");
const {
  createPet,
  getMyPets,
  getPetById,
  updatePet,
  deletePet,
} = require("../controllers/petProfilecontroller");

// Create a new pet
router.post("/", authenticateUser, upload.single("photo"), createPet);

// Get all pets of logged-in user
router.get("/", authenticateUser, getMyPets);

// Get a single pet by its ID
router.get("/:id", authenticateUser, getPetById);

// Update a pet by its ID
router.put("/:id", authenticateUser, upload.single("photo"), updatePet);

// Delete a pet by its ID
router.delete("/:id", authenticateUser, deletePet);

module.exports = router;

