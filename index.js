const express = require("express");
const dbconnect = require("./utils/dbconnect");
const LoginRoute = require("./Router/LoginRoute");
const SignupRoute = require("./Router/SignupRoute");
const ticketsRoutes = require("./Router/TicketsRoute");
const profileRoute = require("./Router/ProfileRoute");
const path = require("path");
const cors = require("cors");

const app = express();

// CORS options
const allowedOrigins = [
  process.env.CLIENT_URL || "https://tms-tau-three.vercel.app/", // Default URL or from env variable
  "https://tms-5qvb1kih1-akshay124-pixels-projects.vercel.app", // Add the new frontend origin
];

// Middleware to handle CORS dynamically based on the allowed origins
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      // Allow requests with no origin (like mobile apps)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (cookies, headers)
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS middleware globally
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging Middleware (optional, useful for debugging)
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
