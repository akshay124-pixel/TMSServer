const express = require("express");
const User = require("../Schema/Models");
const authMiddleware = require("../Middleware/Auth Middleware");
const router = express.Router();

// Fetch user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Fetch user information excluding password
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile from backend:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
