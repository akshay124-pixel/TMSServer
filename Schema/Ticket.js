const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    serialNumber: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true }, // Example regex for 10-digit numbers
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
    assignedTo: { type: String },
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
          // Ensures the action is always traceable to a user
        },
        remarks: {
          type: String,
          default: "No remarks provided", // Ensures a default message if none is given
        },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Middleware to initialize history and record updates
TicketSchema.pre("save", function (next) {
  if (this.isNew) {
    // New ticket creation
    this.history.push({
      status: this.status,
      username: this.username || "System", // Default to "System" if no username
      date: new Date(),
    });
  } else {
    // Status change or update
    if (this.isModified("status")) {
      const lastHistory = this.history[this.history.length - 1];
      if (this.status !== lastHistory?.status) {
        this.history.push({
          status: this.status,
          username: this.username || "System", // Use username from ticket schema
          date: new Date(),
        });
      }
    }
  }
  next();
});

module.exports = mongoose.model("Ticket", TicketSchema);
