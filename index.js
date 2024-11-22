const express = require("express");
const dbconnect = require("./utils/dbconnect");
const LoginRoute = require("./Router/LoginRoute");
const SignupRoute = require("./Router/SignupRoute");
const ticketsRoutes = require("./Router/TicketsRoute");
const profileRoute = require("./Router/ProfileRoute");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware to handle CORS for all origins
const corsOptions = {
  origin: "*", // Allows all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, etc.)
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Middleware to handle preflight OPTIONS requests
app.options("*", cors(corsOptions)); // Allow preflight requests for all routes

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging Middleware (useful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Define routes
app.use("/auth", LoginRoute);
app.use("/user", SignupRoute);
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
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`App listening on port ${port}!`));
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
