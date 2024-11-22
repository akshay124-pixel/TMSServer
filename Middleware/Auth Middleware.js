const jwt = require("jsonwebtoken");
const User = require("../Schema/Models");
const secretKey = require("../utils/config cypt");

const authMiddleware = async (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Check if token is provided
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, secretKey);

    // Fetch user data and exclude the password
    req.user = await User.findById(decoded.id).select("-password");

    // Check if user exists
    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Call the next middleware
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    }

    // Log the error for debugging
    console.error("Token verification error:", error);

    // Return a generic error message for unexpected errors
    return res
      .status(500)
      .json({ message: "An error occurred during token verification." });
  }
};

module.exports = authMiddleware;
