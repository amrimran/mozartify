// mainserver.js - Improved version for Render deployment
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
  "https://mozartify-frontend.onrender.com",
  "https://mozartify.onrender.com",

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

// ================== LOAD BACKEND SERVICES ==================
try {
  console.log("🔄 Loading backend services...");

  // Clear require cache to ensure fresh loading
  delete require.cache[require.resolve("./index.js")];
  delete require.cache[require.resolve("./admin.js")];
  delete require.cache[require.resolve("./server.js")];
  delete require.cache[require.resolve("./inbox.js")];

  // Load all your backend services as modules
  console.log("📦 Loading index.js (Main API)...");
  const mainApp = require("./index.js");
  
  console.log("📦 Loading admin.js (Admin API)...");
  const adminApp = require("./admin.js");
  
  console.log("📦 Loading server.js (Music/Arts API)...");
  const serverApp = require("./server.js");
  
  console.log("📦 Loading inbox.js (Feedback API)...");
  const inboxApp = require("./inbox.js");

  // Mount API routes WITHOUT prefixes (keeping your existing route structure)
  console.log("🔗 Mounting API routes...");
  app.use("/", mainApp); // Main routes: /login, /signup, /logout, etc.
  app.use("/", adminApp); // Admin routes: /users, /admin/stats, etc.
  app.use("/", serverApp); // Server routes: /upload, /catalog, etc.
  app.use("/", inboxApp); // Inbox routes: /api/feedback, etc.

  console.log("✅ All backend services loaded and mounted successfully");
} catch (error) {
  console.error("❌ Error loading backend services:", error);
  console.log("📝 Make sure all 4 files export their Express app:");
  console.log("   - index.js should end with: module.exports = app;");
  console.log("   - admin.js should end with: module.exports = app;");
  console.log("   - server.js should end with: module.exports = app;");
  console.log("   - inbox.js should end with: module.exports = app;");
  
  // Continue without crashing - add a fallback route
  app.get("*", (req, res) => {
    res.status(500).json({
      error: "Backend services failed to load",
      message: "Please check server logs for details"
    });
  });
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
    cors: {
      allowedOrigins: allowedOrigins,
      credentials: true
    }
  });
});

// Test endpoint for debugging
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

// Test login endpoint specifically
app.get("/test-login", (req, res) => {
  res.json({
    message: "Login endpoint is accessible",
    method: "POST /login",
    testUrl: `${req.protocol}://${req.get('host')}/login`,
    timestamp: new Date().toISOString()
  });
});

// ================== ERROR HANDLING ==================
app.use((err, req, res, next) => {
  console.error("🚨 Global error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS policy violation",
      message: "Origin not allowed",
      origin: req.get('origin'),
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
  allowedOrigins.forEach(origin => console.log(`   ✓ ${origin}`));
  console.log(`📡 Health Check: https://mozartify.onrender.com/health`);
  console.log(`🔍 Test Login: https://mozartify.onrender.com/test-login`);
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

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});