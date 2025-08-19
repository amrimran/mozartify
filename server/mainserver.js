require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");

const app = express();

// ================== ENVIRONMENT CONFIG ==================
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 10000;

console.log("🚀 Starting Mozartify Backend Services...");
console.log(`📍 Environment: ${isProduction ? "production" : "development"}`);

// ================== CORS CONFIGURATION (CENTRALIZED) ==================
const allowedOrigins = [
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,
  process.env.BACKEND_PROD_URL,
  process.env.BACKEND_DEV_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:10000",
  "https://mozartify.onrender.com",
  "https://mozartify-nasir.onrender.com",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ================== MONGODB CONNECTION (CENTRALIZED) ==================
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("✅ MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
    });
} else {
  console.log("📊 MongoDB already connected");
}

// ================== SESSION CONFIGURATION (CENTRALIZED) ==================
const store = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: "sessions",
});

store.on("error", (error) => {
  console.log("❌ Session store error:", error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: isProduction ? "none" : "lax",
      httpOnly: true,
      secure: isProduction,
      domain: isProduction ? undefined : undefined, // ✅ ADD THIS
    },
  })
);

console.log("✅ Session middleware configured");

// ================== BASIC MIDDLEWARE ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== STATIC FILE SERVING ==================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================== HEALTH CHECK ==================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      server: "running",
      sessions: "enabled",
    },
    routes: ["index", "admin", "server", "inbox"],
    frontend: "https://mozartify.nasir.onrender.com",
    backend: "https://mozartify.onrender.com",
  });
});

// ================== LOAD ROUTE MODULES (NOT APPS) ==================
try {
  console.log("🔄 Loading route modules...");

  // Import as route modules (these should export routers, not apps)
  const indexRoutes = require("./routes/index");
  const adminRoutes = require("./routes/admin");
  const serverRoutes = require("./routes/server");
  const inboxRoutes = require("./routes/inbox");

  // Mount the routes
  app.use("/", indexRoutes);
  app.use("/", adminRoutes);
  app.use("/", serverRoutes);
  app.use("/", inboxRoutes);

  console.log("✅ All route modules loaded successfully");
} catch (error) {
  console.error("❌ Error loading route modules:", error);
  
  // Fallback error route
  app.get("*", (req, res) => {
    res.status(500).json({
      error: "Backend services failed to load",
      message: error.message
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
  console.log(`🎨 Frontend URL: https://mozartify-nasir.onrender.com`);
  console.log("🚀 =================================\n");
});

// ================== GRACEFUL SHUTDOWN ==================
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down gracefully...");
  mongoose.connection.close();
  process.exit(0);
});