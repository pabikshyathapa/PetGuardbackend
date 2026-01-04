const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerUser = async (req, res) => {
  let { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields including role are required",
    });
  }

  email = email.trim().toLowerCase();

  // Validate role
  if (!["petowner", "shelter"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role selected",
    });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPass,
      role,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.loginUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  email = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(403).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.SECRET || "defaultsecret", {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE LOGGED-IN USER
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user._id; // from authenticateUser middleware
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(phone && { phone }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET LOGGED-IN USER
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required",
      });
    }

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const crypto = require("crypto");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

   
    return res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required",
    });
  }

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



