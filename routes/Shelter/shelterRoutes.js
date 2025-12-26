const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload");
const { authenticateUser, authorizeRoles } = require("../../middlewares/authorizedUser");
const { createOrUpdateShelter, getMyShelter, getAllShelters, getShelterById } = require("../../controllers/Shelter/controllerShelter");
const {searchShelters}=require("../../controllers/searchController")
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
router.get("/search", searchShelters);
router.get("/:id", getShelterById);


module.exports = router;

