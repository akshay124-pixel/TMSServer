const express = require("express");
const dbconnect = require("./utils/dbconnect");
const LoginRoute = require("./Router/LoginRoute");
const SignupRoute = require("./Router/SignupRoute");
const ticketsRoutes = require("./Router/TicketsRoute");
const profileRoute = require("./Router/ProfileRoute");
const path = require("path");
const cors = require("cors");
const fs = require("fs"); // To check file existence

const app = express();

// CORS options
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Use environment variable for React app URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (cookies, headers)
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS middleware globally

app.use(express.json()); // Middleware to parse JSON bodies

// Logging Middleware (optional, useful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the 'uploads' folder for download
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define routes
app.use("/auth", LoginRoute);
app.use("/user", SignupRoute);
app.use("/tickets", ticketsRoutes); // Tickets route
app.use("/user", profileRoute); // User profile route

// 404 Handler (if no route matches)
app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Global error handler (handles uncaught errors)
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

// Route to handle file download (just for verification)
app.get("/uploads/:imageName", (req, res) => {
  const imagePath = path.join(__dirname, "uploads", req.params.imageName);

  // Check if the file exists before attempting to serve it
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", imagePath);
      return res.status(404).json({ error: "File not found!" });
    }

    // Serve the file if it exists
    res.sendFile(imagePath);
  });
});
