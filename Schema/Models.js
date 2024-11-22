const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  agentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ["admin", "client", "opsManager", "serviceAgent"],
    default: "client",
    required: true,
  },
});

// If needed, you can add some validation or business logic to check agentIdbased on role
userSchema.pre("save", function (next) {
  // Validation for agentIddepending on the role
  if (this.role === "serviceAgent" && !this.agentId) {
    return next(new Error("ServiceAgent must have a agentId"));
  }

  if (this.role !== "serviceAgent" && this.agentId) {
    return next(new Error("Non-serviceAgent users should not have a agentId"));
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
