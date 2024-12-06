const mongoose = require("mongoose");

// Feedback schema
const feedbackSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket", // Ensure "Ticket" model exists and is referenced correctly
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Optional: Set a minimum rating value (e.g., 1)
      max: 5, // Optional: Set a maximum rating value (e.g., 5)
    },
    comments: {
      type: String,
      required: true,
      maxlength: 500, // Optional: Limit comment length to 500 characters
    },
  },
  { timestamps: true } // Optional: Automatically adds createdAt and updatedAt fields
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
