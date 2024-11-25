const express = require("express");
const dbconnect = require("./utils/dbconnect");
const LoginRoute = require("./Router/LoginRoute");
const SignupRoute = require("./Router/SignupRoute");
const ticketsRoutes = require("./Router/TicketsRoute");
const profileRoute = require("./Router/ProfileRoute");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware to handle CORS with specific origins and credentials
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from localhost, vercel app, or no origin (e.g., mobile apps or direct requests)
    if (
      !origin || // If there's no origin (like mobile apps or requests from Postman)
      origin.includes("localhost") || // If the origin includes localhost (for local development)
      origin.includes("https://tms-tau-three.vercel.app") // Allow requests from your deployed frontend URL
    ) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Reject requests from other origins
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, etc.)
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Middleware to handle preflight OPTIONS requests
app.options("*", cors(corsOptions)); // Allow preflight requests for all routes

app.use(express.json()); // Parse incoming JSON requests
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files from the uploads folder

// Logging Middleware (useful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Define routes
app.use("/auth", LoginRoute); // Login route
app.use("/user", SignupRoute); // Signup route
app.use("/tickets", ticketsRoutes); // Tickets route
app.use("/user", profileRoute); // User profile route

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Database connection and server start
dbconnect()
  .then(() => {
    const port = process.env.PORT || 5000; // Set port for the server
    app.listen(port, () => console.log(`App listening on port ${port}!`)); // Start the server
  })
  .catch((err) => {
    console.error("Database connection failed:", err); // Log database connection failure
    process.exit(1); // Exit the application if database connection fails
  });
