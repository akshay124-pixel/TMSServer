const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    serialNumber: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    billNumber: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    remarks: { type: String },
    partName: { type: String },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productType: {
      type: String,
      enum: ["Product A", "Product B", "Product C"],
      default: "Product A",
      required: true,
    },
    modelType: {
      type: String,
      enum: ["Model A", "Model B", "Model C"],
      default: "Model A",
      required: true,
    },
    Type: {
      type: String,
      enum: ["Replacement", "Repair", "Not Received", "Received"],
      default: "Repair",
    },
    address: { type: String, required: true },
    call: {
      type: String,
      enum: ["Select Call", "Hardware Call", "Software Call"],
      default: "Select Call",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    assignedTo: {
      type: String,
      default: "Not Assigned", // Default value for unassigned tickets
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High"],
      default: "Normal",
    },
    trackingId: { type: String, unique: true, required: true },
    opsManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OpsManager",
      default: null,
    },
    history: [
      {
        status: {
          type: String,
          enum: ["Open", "In Progress", "Resolved", "Closed"],
          default: "Open",
        },
        username: {
          type: String,
        },
        remarks: {
          type: String,
          default: "No remarks provided",
        },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Function to categorize TAT
TicketSchema.methods.getTATCategory = function () {
  const createdAt = this.createdAt;
  const updatedAt = this.updatedAt || new Date(); // Default to current time if no updatedAt

  const timeDiff = updatedAt - createdAt; // Difference in milliseconds
  const days = timeDiff / (1000 * 3600 * 24); // Convert milliseconds to days

  if (days <= 2) {
    return "0 to 2 days";
  } else if (days >= 3 && days <= 4) {
    return "3 to 4 days";
  } else if (days >= 5 && days <= 8) {
    return "5 to 8 days";
  } else if (days >= 14) {
    return "14 days or more";
  } else {
    return "Unknown"; // If the status is still open, or no closed date
  }
};

// Middleware to initialize history and record updates
TicketSchema.pre("save", function (next) {
  if (this.isNew) {
    this.history.push({
      status: this.status,
      username: this.username || "System", // Default to "System" if no username
      date: new Date(),
    });
  } else {
    if (this.isModified("status")) {
      const lastHistory = this.history[this.history.length - 1];
      if (this.status !== lastHistory?.status) {
        this.history.push({
          status: this.status,
          username: this.username || "System",
          date: new Date(),
        });
      }
    }
  }
  next();
});

module.exports = mongoose.model("Ticket", TicketSchema);
