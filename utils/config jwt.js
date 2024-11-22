const jwt = require("jsonwebtoken");
const secretkey = require("./config cypt"); // Assuming you export your secret key from config.js

// Generate a JWT token
function generateToken(user) {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role, // Add the role in the payload
  };
  return jwt.sign(payload, secretkey, { expiresIn: "1h" });
}

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res
      .status(403)
      .json({ message: "No token provided, access denied." });
  }

  try {
    const decoded = jwt.verify(token, secretkey); // Verify the token with your secret
    req.user = decoded; // Attach decoded user data to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Combined export statement
module.exports = { generateToken, verifyToken };
