const User = require("../models/User");
const Shelter = require("../models/Shelter/shelter");

// ADD SHELTER TO FAVORITES
exports.addToFavorites = async (req, res) => {
  try {
    const { shelterId } = req.body;
    const userId = req.user._id;

    // Validate shelter exists
    const shelter = await Shelter.findById(shelterId);
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    // Find user and check if shelter already in favorites
    const user = await User.findById(userId);
    if (user.favorites.includes(shelterId)) {
      return res.status(400).json({ message: "Shelter already in favorites" });
    }

    // Add to favorites
    user.favorites.push(shelterId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Shelter added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({ message: "Failed to add to favorites", error: error.message });
  }
};

// REMOVE SHELTER FROM FAVORITES
exports.removeFromFavorites = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const userId = req.user._id;

    // Find user and remove shelter from favorites
    const user = await User.findById(userId);
    const index = user.favorites.indexOf(shelterId);

    if (index === -1) {
      return res.status(404).json({ message: "Shelter not in favorites" });
    }

    user.favorites.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Shelter removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({ message: "Failed to remove from favorites", error: error.message });
  }
};

// GET ALL FAVORITE SHELTERS
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "favorites",
      select: "name location contact description services status pricePerDay photos averageRating reviewCount",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      favorites: user.favorites,
      count: user.favorites.length,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Failed to fetch favorites", error: error.message });
  }
};

// CHECK IF SHELTER IS IN FAVORITES
exports.checkFavorite = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isFavorite = user.favorites.includes(shelterId);

    res.status(200).json({
      success: true,
      isFavorite,
    });
  } catch (error) {
    console.error("Check favorite error:", error);
    res.status(500).json({ message: "Failed to check favorite status", error: error.message });
  }
};

// TOGGLE FAVORITE (ADD OR REMOVE)
exports.toggleFavorite = async (req, res) => {
  try {
    const { shelterId } = req.body;
    const userId = req.user._id;

    // Validate shelter exists
    const shelter = await Shelter.findById(shelterId);
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    const user = await User.findById(userId);
    const index = user.favorites.indexOf(shelterId);

    if (index === -1) {
      // Add to favorites
      user.favorites.push(shelterId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Shelter added to favorites",
        isFavorite: true,
        favorites: user.favorites,
      });
    } else {
      // Remove from favorites
      user.favorites.splice(index, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Shelter removed from favorites",
        isFavorite: false,
        favorites: user.favorites,
      });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ message: "Failed to toggle favorite", error: error.message });
  }
};