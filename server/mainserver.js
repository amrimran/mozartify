// mainserver.js - Simplified Single Server for Render Deployment
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const multer = require("multer");
const axios = require("axios");

// ================== MODEL IMPORTS ==================
const UserModel = require("./models/User");
const PurchaseModel = require("./models/Purchase");
const Purchase2Model = require("./models/Purchase2");
const CartModel = require("./models/Cart");
const Cart2Model = require("./models/Cart2");
const DeletedUserModel = require("./models/DeletedUser");
const ABCFileModel = require("./models/ABCFile");
const DeletedABCFile = require("./models/deletedABCFile");
const ArtworkModel = require("./models/Arts");
const DeletedArtwork = require("./models/DeletedArts");
const ArtsDynamicField = require("./models/ArtsDynamicField");
const ArtsTab = require("./models/ArtsTab");
const MusicDynamicField = require("./models/MusicDynamicField");
const MusicTab = require("./models/MusicTab");
const Feedback = require("./models/Feedback");
const Feedback2 = require("./models/Feedback2");

// ================== EXPRESS APP SETUP ==================
const app = express();
const PORT = process.env.PORT || 10000;
const SALT_ROUNDS = 10;

// ================== MIDDLEWARE SETUP ==================
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ================== ENVIRONMENT CONFIG ==================
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = isProduction
  ? process.env.FRONTEND_PROD_URL
  : process.env.FRONTEND_DEV_URL;
const backendUrl = isProduction
  ? process.env.BACKEND_PROD_URL
  : process.env.BACKEND_DEV_URL;

// ================== CORS CONFIGURATION ==================
const allowedOrigins = [
  frontendUrl,
  backendUrl,
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,
  'https://mozartify.onrender.com', // Your actual Render backend URL
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:10000',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ================== SESSION STORE SETUP ==================
const store = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: "sessions",
  touchAfter: 24 * 3600,
});

store.on("error", (error) => {
  console.log("Session store error:", error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      httpOnly: true,
    },
  })
);

// ================== MULTER SETUP ==================
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// ================== MONGODB CONNECTION ==================
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ================== FASTAPI ENDPOINT CONFIG ==================
const FASTAPI_BASE_URL = isProduction
  ? process.env.FASTAPI_PROD_URL
  : process.env.FASTAPI_DEV_URL;

const fastApiEndpoints = {
  emotion: `${FASTAPI_BASE_URL}/predict-emotion`,
  gender: `${FASTAPI_BASE_URL}/predict-gender`,
  genre: `${FASTAPI_BASE_URL}/predict-genre`,
  instrument: `${FASTAPI_BASE_URL}/predict-instrument`
};

// ================== HEALTH CHECK ROUTES ==================
app.get("/", (req, res) => {
  res.json({
    message: "🎵 Mozartify Backend API is running!",
    status: "healthy",
    environment: process.env.NODE_ENV || 'development',
    backend_url: isProduction ? `https://${req.get('host')}` : 'http://localhost:10000',
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ================== AUTH ROUTES (from index.js) ==================
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this username or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "customer",
      isApproved: true,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await UserModel.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: "Account not approved yet" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================== FAVORITES ROUTES ==================
app.post("/set-favorites", async (req, res) => {
  const userId = req.session.userId;
  const { musicScoreId, action } = req.body;

  if (!mongoose.Types.ObjectId.isValid(musicScoreId)) {
    return res.status(400).json({ message: "Invalid musicScoreId format" });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "add") {
      if (!user.favorites_music.includes(musicScoreId)) {
        user.favorites_music.push(musicScoreId);
      }
    } else if (action === "remove") {
      user.favorites_music = user.favorites_music.filter(
        (favId) => favId.toString() !== musicScoreId
      );
    } else {
      return res.status(400).json({ message: "Invalid action specified" });
    }

    await user.save();

    res.json({
      message: "Favorite updated successfully",
      favorites_music: user.favorites_music,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// ================== FEEDBACK ROUTES (from inbox.js) ==================
app.post("/api/feedback", upload.none(), async (req, res) => {
  const { username, title, detail, user_id, attachment_url } = req.body;

  const feedback = new Feedback({
    username,
    title,
    detail,
    attachment_url,
    user_id,
    status: "pending",
  });

  try {
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ================== MUSIC PREDICTION ROUTES (from server.js) ==================
app.post("/predictEmotion", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).send("No file URL provided.");
  }

  try {
    const response = await axios.post(fastApiEndpoints.emotion, { fileUrl });
    res.json(response.data);
  } catch (error) {
    console.error("Error predicting emotion:", error);
    res.status(500).send("Error predicting emotion");
  }
});

// ================== ABC FILE ROUTES ==================
app.get("/abc-file", async (req, res) => {
  try {
    const { sortOrder = "desc", sortBy = "_id" } = req.query;
    const mongoSortOrder = sortOrder === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = mongoSortOrder;

    const files = await ABCFileModel.find({}).sort(sortOptions);
    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching ABC files:", err);
    res.status(500).json({ message: "Error fetching ABC files", error: err.message });
  }
});

// ================== USER MANAGEMENT ROUTES (from admin.js) ==================
app.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ================== ERROR HANDLING MIDDLEWARE ==================
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ================== 404 HANDLER ==================
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

// ================== SERVER START ==================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mozartify Backend Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log(`🔗 Backend URL: ${backendUrl}`);
  console.log(`🤖 FastAPI URL: ${FASTAPI_BASE_URL}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;