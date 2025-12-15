// const express = require("express");
// const router = express.Router();

// const upload = require("../../middlewares/upload");
// const {
//   authenticateUser,
//   authorizeRoles,
// } = require("../../middlewares/authorizedUser");

// const {
//   createOrUpdateShelter,
//   getMyShelter,
//   getAllShelters,
// } = require("../../controllers/Shelter/controllerShelter");

// router.post(
//   "/",
//   authenticateUser,
//   authorizeRoles("shelter"),
//   upload.fields([
//     { name: "photos", maxCount: 5 },
//     { name: "documents", maxCount: 5 },
//   ]),
//   createOrUpdateShelter
// );

// router.get("/me", authenticateUser, authorizeRoles("shelter"), getMyShelter);
// router.get("/", getAllShelters); // for pet owners

// module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload");
const { authenticateUser, authorizeRoles } = require("../../middlewares/authorizedUser");
const { createOrUpdateShelter, getMyShelter, getAllShelters } = require("../../controllers/Shelter/controllerShelter");

// For multiple file uploads
router.post(
  "/",
  authenticateUser,
  authorizeRoles("shelter"),
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "documents", maxCount: 5 },
  ]),
  createOrUpdateShelter
);

router.get("/me", authenticateUser, authorizeRoles("shelter"), getMyShelter);
router.get("/", getAllShelters);

module.exports = router;

