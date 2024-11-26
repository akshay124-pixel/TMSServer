const express = require("express");
const User = require("../Schema/Models");
const Ticket = require("../Schema/Ticket");
const router = express.Router();
const { verifyToken } = require("../utils/config jwt");
const mongoose = require("mongoose");
const validateTicket = require("../Middleware/validate-middleware");

// Route to create a new ticket
router.post("/create", validateTicket, async (req, res) => {
  try {
    // Access validated data
    const {
      customerName,
      serialNumber,
      description,
      contactNumber,
      billNumber,
      email,
      productType,
      modelType,
      address,
      city,
      state,
    } = req.validatedData;

    const trackingId = generateTrackingId();

    // Calculate initial TAT category (for a newly created ticket, it will be "0-2 days")
    const createdDate = new Date();
    let tat = "0-2 days";

    const ticket = new Ticket({
      customerName,
      serialNumber,
      description,
      contactNumber,
      billNumber,
      email,
      productType,
      modelType,
      address,
      city,
      state,
      trackingId,
      call: "Select Call",
      status: "Open",
      tat,
      createdAt: createdDate, // Automatically handled by mongoose's timestamps
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

// Route to fetch all tickets
router.get("/ticket", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Route to search for tickets
router.get("/ticket/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const tickets = await Ticket.find({
      $or: [
        { customerName: { $regex: query, $options: "" } },
        { serialNumber: { $regex: query, $options: "" } },
        { description: { $regex: query, $options: "" } },
      ],
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error searching tickets:", error);
    res.status(500).json({ error: "Failed to search tickets" });
  }
});

// Update Route
router.put("/update/:id", async (req, res) => {
  try {
    const { status, assignedTo, priority, call, remarks, partName, Type } =
      req.body;

    // Validate the ticket ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Flag to track if history should be pushed
    let historyChanges = false;

    // Object to track changes
    const changes = {};

    // Track changes for `status` and `remarks` (these go to history)
    if (status && ticket.status !== status) {
      changes.status = status;
      ticket.status = status;
      historyChanges = true;
    }

    if (remarks && ticket.remarks !== remarks) {
      changes.remarks = remarks;
      ticket.remarks = remarks;
      historyChanges = true;
    }

    // Update other fields (these won't push to history)
    if (call !== undefined && ticket.call !== call) {
      ticket.call = call;
    }

    if (Type && ticket.Type !== Type) {
      ticket.Type = Type;
    }

    if (partName && ticket.partName !== partName) {
      ticket.partName = partName;
    }

    if (priority && ticket.priority !== priority) {
      ticket.priority = priority;
    }

    // Handle `assignedTo` updates (set to "Not Assigned" if null/empty)
    if (assignedTo !== undefined) {
      if (ticket.assignedTo !== assignedTo) {
        ticket.assignedTo = assignedTo || "Not Assigned";
      }
    }

    // Push changes to history only for `status` and `remarks`
    if (historyChanges) {
      ticket.history.push({
        ...changes,
        username: req.username, // Replace with actual username from auth
        date: new Date(),
      });
    }

    // Save the updated ticket
    await ticket.save();

    return res.json(ticket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// Delete a ticket
router.delete("/delete/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

// Mark ticket as resolved
router.put("/resolve/:ticketId", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    ticket.status = "Resolved";
    await ticket.save();
    res.status(200).json({ message: "Ticket marked as resolved" });
  } catch (error) {
    console.error("Error updating ticket status to resolved:", error);
    res.status(500).json({ error: "Failed to resolve ticket" });
  }
});

// Unassign a service agent from a ticket
router.put("/unassign/:ticketId", async (req, res) => {
  const { ticketId } = req.params;

  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { assignedTo: null },
      { new: true }
    );

    res.json({ message: "Agent unassigned successfully", updatedTicket });
  } catch (error) {
    console.error("Error unassigning agent:", error);
    res.status(500).json({ error: "Failed to unassign agent" });
  }
});

// Fetch tickets assigned to a specific service agent
// Fetch tickets assigned to a specific service agent
router.get("/assigned/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params; // Get the agentId from the request parameters

    // Check if agentId is provided in the URL
    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required." });
    }

    // Find tickets assigned to the given agentId
    const tickets = await Ticket.find({ assignedTo: agentId }); // Use 'assignedTo' field to filter tickets

    // Check if any tickets were found
    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets assigned to this agent." });
    }

    // Send the list of tickets
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Error fetching tickets." });
  }
});

// Update ticket status by service agent
router.put("/update-status/:ticketId", async (req, res) => {
  const { status } = req.body;
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { status },
      { new: true }
    );
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

// Assign a ticket to a service agent and notify via SMS
router.put("/assign/:ticketId", async (req, res) => {
  const { agentId } = req.body;
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { assignedTo: agentId },
      { new: true }
    );
    if (ticket) {
      console.log(
        `A new ticket has been assigned to you. Ticket ID: ${ticket._id}, Priority: ${ticket.priority}. Please log in to view details.`
      );
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to assign ticket" });
  }
});

// New Fetch Role
router.get("/role/:role", verifyToken, async (req, res) => {
  try {
    const { role } = req.params; // URL se role parameter fetch karna

    // Role ko validate karna
    if (!["admin", "client", "opsManager", "serviceAgent"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // Users ko database se fetch karna based on role
    const users = await User.find({ role: role });

    // Agar users nahi milte
    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: `No users found with the role ${role}.` });
    }

    // Agar users milte hain, toh unhe return kar dena
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Function to generate a unique tracking ID
function generateTrackingId() {
  return `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

module.exports = router;
