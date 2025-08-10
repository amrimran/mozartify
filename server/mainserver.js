// mainserver.js - Complete server that handles both backend APIs and serves frontend (if needed)
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// ================== ENVIRONMENT CONFIG ==================
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 10000;

console.log("🚀 Starting Mozartify Backend Services...");
console.log(`📍 Environment: ${isProduction ? "production" : "development"}`);
console.log(`🌐 Working Directory: ${process.cwd()}`);

// ================== CORS CONFIGURATION ==================
const allowedOrigins = [
  // Your actual Render domains
  "https://mozartify-frontend.onrender.com", // Frontend domain
  "https://mozartify.onrender.com", // Backend domain

  // Environment variables (backup)
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,
  process.env.BACKEND_PROD_URL,
  process.env.BACKEND_DEV_URL,

  // Development URLs
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:10000",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌐 CORS check for origin:", origin);

    // Allow requests with no origin (mobile apps, Postman, curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      console.log("✅ CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // CRITICAL: Enable cookies/sessions
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== SERVE STATIC FILES (Optional - since you have separate frontend) ==================
// This is optional since your frontend is on mozartify-frontend.onrender.com
// But keeping it for local development or fallback
if (isProduction) {
  // Only serve static files if dist folder exists
  const distPath = path.join(__dirname, "dist");
  try {
    if (require("fs").existsSync(distPath)) {
      app.use("/assets", express.static(path.join(distPath, "assets")));
      app.use(express.static(distPath));
      console.log("📦 Serving static files from:", distPath);
    } else {
      console.log("ℹ️ No dist folder found - frontend served separately");
    }
  } catch (err) {
    console.log("ℹ️ Static file serving disabled - frontend served separately");
  }
}

// ================== LOAD BACKEND SERVICES ==================
try {
  console.log("🔄 Loading backend services...");

  // Clear require cache to ensure fresh loading
  delete require.cache[require.resolve("./index.js")];
  delete require.cache[require.resolve("./admin.js")];
  delete require.cache[require.resolve("./server.js")];
  delete require.cache[require.resolve("./inbox.js")];

  // Load all your backend services as modules
  const mainApp = require("./index.js");
  const adminApp = require("./admin.js");
  const serverApp = require("./server.js");
  const inboxApp = require("./inbox.js");

  // Mount API routes WITHOUT prefixes (keeping your existing route structure)
  console.log("🔗 Mounting API routes...");
  app.use("/", mainApp); // Main routes: /login, /signup, /logout, etc.
  app.use("/", adminApp); // Admin routes: /users, /admin/stats, etc.
  app.use("/", serverApp); // Server routes: /upload, /catalog, etc.
  app.use("/api", inboxApp); // Inbox routes: /api/feedback, etc.

  console.log("✅ All backend services loaded and mounted successfully");
} catch (error) {
  console.error("❌ Error loading backend services:", error);
  console.log("📝 Make sure all 4 files export their Express app:");
  console.log("   - index.js should end with: module.exports = app;");
  console.log("   - admin.js should end with: module.exports = app;");
  console.log("   - server.js should end with: module.exports = app;");
  console.log("   - inbox.js should end with: module.exports = app;");
}

// ================== HEALTH CHECK ROUTES ==================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: [
      "Main API (index.js)",
      "Admin API (admin.js)",
      "Server API (server.js)",
      "Inbox API (inbox.js)",
    ],
    frontend: "https://mozartify-frontend.onrender.com",
    backend: "https://mozartify.onrender.com",
  });
});

// Root endpoint for backend API
app.get("/api/status", (req, res) => {
  res.json({
    message: "🎵 Mozartify Backend API is running!",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      frontend: "https://mozartify-frontend.onrender.com",
      backend: "https://mozartify.onrender.com",
      status: "operational",
    },
  });
});

// ================== SPA ROUTING - CRITICAL FIX ==================
// This handles the 404 issue when refreshing pages
if (isProduction) {
  // Catch all handler for non-API routes
  app.get("*", (req, res) => {
    console.log("🔍 Catch-all route hit:", req.path);

    // List of API routes that should return 404 instead of serving HTML
    const apiRoutes = [
      "/api/",
      "/login",
      "/signup",
      "/logout",
      "/users",
      "/upload",
      "/catalog",
      "/admin/",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
      "/preferences",
      "/search",
      "/download",
      "/predictEmotion",
      "/predictGender",
      "/predictGenre",
      "/abc-file",
      "/api/feedback",

    ];

    // If it's an API route, return 404
    if (apiRoutes.some((route) => req.path.startsWith(route))) {
      console.log("❌ API endpoint not found:", req.path);
      return res.status(404).json({
        error: "API endpoint not found",
        path: req.path,
        message: "This endpoint does not exist on the backend API",
      });
    }

    // For frontend routes, redirect to frontend domain
    const frontendUrl = `https://mozartify-frontend.onrender.com${req.path}`;
    console.log("🔄 Redirecting to frontend:", frontendUrl);

    res.redirect(301, frontendUrl);
  });
} else {
  // Development fallback
  app.get("*", (req, res) => {
    if (
      req.path.startsWith("/api/") ||
      req.path.startsWith("/login") ||
      req.path.startsWith("/signup")
    ) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    res.json({
      message: "🎵 Mozartify Backend API - Development Mode",
      note: "Frontend should be running on http://localhost:5173",
      requestedPath: req.path,
      suggestion: "This looks like a frontend route",
    });
  });
}

// ================== ERROR HANDLING ==================
app.use((err, req, res, next) => {
  console.error("🚨 Global error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS policy violation",
      message: "Origin not allowed",
      allowedOrigins: allowedOrigins.filter(Boolean),
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message: isProduction ? "Something went wrong" : err.message,
  });
});

// ================== START SERVER ==================
app.listen(PORT, "0.0.0.0", () => {
  console.log("\n🚀 =================================");
  console.log(`   Mozartify Backend Server`);
  console.log("🚀 =================================");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Backend URL: https://mozartify.onrender.com`);
  console.log(`🎨 Frontend URL: https://mozartify-frontend.onrender.com`);
  console.log(`🔗 CORS Origins: ${allowedOrigins.length} configured`);
  console.log(`   ${allowedOrigins.join("\n   ")}`);
  console.log(`📡 Health Check: https://mozartify.onrender.com/health`);
  console.log("🚀 =================================\n");
});

// ================== GRACEFUL SHUTDOWN ==================
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
