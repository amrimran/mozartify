require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { MongoClient, ObjectId } = require("mongodb");
const { PythonShell } = require("python-shell");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const UserModel = require("./models/User");
const PurchaseModel = require("./models/Purchase");
const Purchase2Model = require("./models/Purchase2");
const CartModel = require("./models/Cart");
const Cart2Model = require("./models/Cart2");
const DeletedUserModel = require("./models/DeletedUser");
const ABCFileModel = require("./models/ABCFile");
const ArtworkModel = require("./models/Arts");

const app = express();

// ================== ENVIRONMENT CONFIG ==================
const isProduction = process.env.NODE_ENV === "production";

console.log("🚀 Starting Mozartify Main API Server...");
console.log(`📍 Environment: ${isProduction ? "production" : "development"}`);

// ================== CORS CONFIGURATION ==================
const allowedOrigins = [
  // Frontend URLs
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,

  // Backend URLs (for internal communication)
  process.env.BACKEND_PROD_URL,
  process.env.BACKEND_DEV_URL,

  // Development URLs
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:10000",

  // Render URLs
  "https://mozartify.onrender.com",
  "https://mozartify-frontend.onrender.com",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ================== MONGODB CONNECTION ==================

console.log("🔄 Connecting to MongoDB...");

if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("📊 MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
    });
} else {
  console.log("📊 MongoDB already connected");
}

// ================== SESSION CONFIGURATION ==================
const disableSessions = process.env.DISABLE_SESSIONS === "true";

if (!disableSessions) {
  const store = new MongoDBStore({
    uri: process.env.DB_URI,
    collection: "sessions",
  });

  store.on("error", (error) => {
    console.error("❌ Session store error:", error);
  });

  store.on("connected", () => {
    console.log("✅ Session store connected");
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,        // CHANGE: Allow uninitialized sessions
      store: store,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,   // 1 day
        sameSite: 'none',              
        secure: true,                  
        httpOnly: true,
      },
      name: 'sessionId',
      rolling: true,                   // ADD: Refresh cookie on each request
    })
  );
  
  console.log("✅ Session middleware configured");
} else {
  console.log("⚠️ Sessions disabled - using memory store");
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'fallback-secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'none',
        secure: true,
        httpOnly: true,
      },
      name: 'sessionId',
      rolling: true,
    })
  );
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== HEALTH CHECK ROUTES ==================
app.get("/", (req, res) => {
  res.json({
    message: "🎵 Mozartify Main API Server is running!",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      server: 'running',
      sessions: disableSessions ? 'disabled' : 'enabled'
    },
    frontend: "https://mozartify-frontend.onrender.com",
    backend: "https://mozartify.onrender.com",
  });
});

// Add this debug route to your server/index.js:
app.get("/debug-session", (req, res) => {
  res.json({
    sessionId: req.session.id,
    userId: req.session.userId,
    sessionData: req.session,
    cookies: req.headers.cookie,
    origin: req.get('origin'),
    userAgent: req.get('user-agent')
  });
});

app.post("/test-session", (req, res) => {
  req.session.testData = "Hello World";
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: "Session save failed", details: err });
    }
    res.json({ 
      message: "Session saved successfully",
      sessionId: req.session.id,
      testData: req.session.testData 
    });
  });
});

// ================== EMAIL CONFIGURATION ==================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = (email, username, token) => {
  const frontendUrl = isProduction
    ? process.env.FRONTEND_PROD_URL
    : process.env.FRONTEND_DEV_URL;

  const verificationUrl = `${frontendUrl}/email-verification?token=${token}`;
  const emailTemplate = `
  <div style="border: 2px solid #8BD3E6; border-radius: 10px; padding: 20px; font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9FBFC;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #8BD3E6; font-size: 20px; margin: 0; font-weight: bold;">A Musicians' Notation And Score Integration Resource</h1>
      <p style="color: #6C757D; font-size: 16px; margin: 5px 0 0;">Your Registration Portal</p>
    </div>
    <div style="padding: 20px; background: #FFFFFF; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
      <p style="color: #333333; font-size: 16px; margin: 0;">Hi <strong>${username}</strong>,</p>
      <p style="color: #555555; font-size: 14px; line-height: 1.6;">
        Thank you for registering with <strong style="color: #8BD3E6;">N.A.S.I.R </strong>! Please verify your email address to complete your registration.
      </p>
      <p style="color: #333333; font-size: 14px; margin: 10px 0;"><strong>Email:</strong> ${email}</p>
      <p style="color: #555555; font-size: 14px; line-height: 1.6;">
        Click the button below to verify your email address:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 25px; font-size: 14px; font-weight: bold; color: #FFFFFF; background-color: #8BD3E6; border-radius: 5px; text-decoration: none;">
          VERIFY EMAIL
        </a>
      </div>
      <p style="color: #6C757D; font-size: 12px; text-align: center; margin-top: 20px;">
        If you did not register for this account, please disregard this email.
      </p>
    </div>
  </div>
`;

  transporter.sendMail(
    {
      from: '"N.A.S.I.R Music System" <nasir.music.system@gmail.com>',
      to: email,
      subject: "N.A.S.I.R: Email Verification",
      html: emailTemplate,
    },
    (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    }
  );
};

const sendAdminApprovalEmail = (adminEmail, username, email) => {
  const emailTemplate = `
  <div style="border: 2px solid #8BD3E6; border-radius: 10px; padding: 20px; font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9FBFC;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #8BD3E6; font-size: 28px; margin: 0; font-weight: bold;">A Musicians' Notation And Score Integration Resource</h1>
    </div>
    <div style="padding: 20px; background: #FFFFFF; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: left;">
      <p style="color: #333333; font-size: 16px;">Admin,</p>
      <p style="color: #555555; font-size: 14px; line-height: 1.6;">
        A new user has requested to become a Music Entry Clerk.
      </p>
      <p style="color: #333333; font-size: 14px; margin: 10px 0;"><strong>Username:</strong> ${username}</p>
      <p style="color: #333333; font-size: 14px; margin: 10px 0;"><strong>Email:</strong> ${email}</p>
      <p style="color: #555555; font-size: 14px; line-height: 1.6;">
        Please review and approve their request in the admin panel.
      </p>
    </div>
  </div>
`;

  transporter.sendMail(
    {
      from: '"N.A.S.I.R Music System" <nasir.music.system@gmail.com>',
      to: adminEmail,
      subject: "N.A.S.I.R: New Music Entry Clerk Approval Needed",
      html: emailTemplate,
    },
    (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Admin email sent:", info.response);
      }
    }
  );
};

// Add this debug middleware BEFORE your routes in server/index.js:

app.use((req, res, next) => {
  // Only log for specific routes that are failing
  if (req.path.includes('/current-user') || req.path.includes('/recommendations')) {
    console.log(`🔍 ${req.method} ${req.path}`);
    console.log(`   Session ID: ${req.session?.id}`);
    console.log(`   User ID in session: ${req.session?.userId}`);
    console.log(`   Session data:`, req.session);
    console.log(`   Cookies:`, req.headers.cookie);
  }
  next();
});

// Update your isAuthenticated middleware to be more descriptive:
const isAuthenticated = (req, res, next) => {
  console.log(`🔐 Auth check - Session ID: ${req.session?.id}, User ID: ${req.session?.userId}`);
  
  if (req.session.userId) {
    console.log("✅ User authenticated");
    return next();
  }
  
  console.log("❌ User not authenticated - no userId in session");
  res.status(401).json({ 
    message: "Unauthorized",
    debug: {
      sessionId: req.session?.id,
      hasUserId: !!req.session?.userId,
      sessionData: req.session
    }
  });
};

app.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await UserModel.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword, // Store hashed password
      role,
      approval: role === "customer" ? "approved" : "pending",
      first_timer: true,
    });

    await newUser.save();

    if (role === "customer") {
      const token = jwt.sign(
        { username, email, role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      sendVerificationEmail(email, username, token);
      res.json({ message: "Verification email sent" });
    } else if (role === "music_entry_clerk") {
      sendAdminApprovalEmail(process.env.ADMIN_EMAIL, username, email);
      res.json({ message: "Your request has been submitted for approval" });
    } else {
      res.status(400).json({ message: "Invalid role" });
    }
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await UserModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the approval status
    res.json({
      approval: user.approval,
    });
  } catch (err) {
    console.error("Error checking approval:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

app.get("/login", async (req, res) => {
  try {
    // Check if there's an active session
    if (!req.session.userId) {
      return res.status(401).json({ message: "No active session" });
    }

    // Find the user
    const user = await UserModel.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the same information as the POST login endpoint
    res.json({
      message: "Success",
      userId: user._id,
      role: user.role,
      music_first_timer: user.music_first_timer,
      art_first_timer: user.art_first_timer,
      approval: user.approval,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username_or_email, password } = req.body;

  try {
    const user = await UserModel.findOne({
      $or: [{ email: username_or_email }, { username: username_or_email }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: `Account locked. Please try again after ${Math.ceil(
          (user.lockUntil - Date.now()) / 60000
        )} minutes.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 10) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000);
      }
      await user.save();
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    if (user.sessionId && user.sessionId !== req.session.id) {
      return res.status(403).json({
        message: "You are already logged in on another device/browser. Please log out first.",
      });
    }

    user.sessionId = req.session.id;
    await user.save();

    // CRITICAL: Save userId to session
    req.session.userId = user._id;
    
    // CRITICAL: Ensure session is saved before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session save failed" });
      }
      
      console.log("✅ Session saved with userId:", user._id);
      
      res.json({
        message: "Success",
        userId: user._id,
        role: user.role,
        music_first_timer: user.music_first_timer,
        art_first_timer: user.art_first_timer,
        approval: user.approval,
      });
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to handle logout and clear session ID
app.get("/logout", async (req, res) => {
  try {
    const userId = req.session.userId; // Retrieve the logged-in user's ID from the session

    if (userId) {
      // Find the user in the database and set sessionId to null
      await UserModel.findByIdAndUpdate(userId, { sessionId: null });

      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Failed to log out" });
        }

        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.status(400).json({ message: "No active session to log out" });
    }
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/preferences-options", async (req, res) => {
  try {
    const composers = await ABCFileModel.distinct("composer");
    const genres = await ABCFileModel.distinct("genre");
    const emotions = await ABCFileModel.distinct("emotion");

    res.status(200).json({ composers, genres, emotions });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences." });
  }
});

app.get("/art-preferences-options", async (req, res) => {
  try {
    const artist = await ArtworkModel.distinct("artist");
    const collection = await ArtworkModel.distinct("collection");

    res.status(200).json({ artist, collection });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences." });
  }
});

app.post("/preferences", async (req, res) => {
  const { composer_preferences, genre_preferences, emotion_preferences } =
    req.body;
  const userId = req.session.userId;
  let client;
  const dbName = "mozartify";
  const collectionName = "users";

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    client = new MongoClient(process.env.DB_URI);
    await client.connect();
    const db = client.db(dbName);
    const collectiondb = db.collection(collectionName);

    const updateResult = await collectiondb.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          composer_preferences,
          genre_preferences,
          emotion_preferences,
          first_timer: false,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found or preferences not updated" });
    }

    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (err) {
    console.error(`Error: ${err}`);
    res.status(500).json({ error: "Failed to update preferences" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.post("/art-preferences", async (req, res) => {
  const { artist_preferences, colletion_preferences } = req.body;
  const userId = req.session.userId;
  let client;
  const dbName = "mozartify";
  const collectionName = "users";

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    client = new MongoClient(process.env.DB_URI);
    await client.connect();
    const db = client.db(dbName);
    const collectiondb = db.collection(collectionName);

    const updateResult = await collectiondb.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          artist_preferences,
          colletion_preferences,
          art_first_timer: false,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found or preferences not updated" });
    }

    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (err) {
    console.error(`Error: ${err}`);
    res.status(500).json({ error: "Failed to update preferences" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.get("/refine-search", async (req, res) => {
  try {
    const composers = await ABCFileModel.distinct("composer");
    const genres = await ABCFileModel.distinct("genre");
    const emotions = await ABCFileModel.distinct("emotion");
    const instrumentation = await ABCFileModel.distinct("instrumentation");

    res.status(200).json({ composers, genres, emotions, instrumentation });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences." });
  }
});

app.get("/artwork-refine-search", async (req, res) => {
  try {
    // Get one sample doc to inspect fields
    const sample = await ArtworkModel.findOne().lean();
    if (!sample) {
      return res.status(200).json({});
    }

    // Fields to exclude
    const excludeFields = [
      "_id",
      "__v",
      "downloads",
      "deleted",
      "price",
      "imageUrl",
      "dateUploaded",
      "createdAt",
      "updatedAt",
      "title",
    ];

    // Extract filterable fields
    const fieldsToFilter = Object.keys(sample).filter(
      (key) => !excludeFields.includes(key)
    );

    // Fetch distinct values for each field
    const filters = {};
    for (const field of fieldsToFilter) {
      filters[field] = await ArtworkModel.distinct(field);
    }

    res.status(200).json(filters);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences." });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5m", // Set token expiration to 5 minutes
    });

    const frontendUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_PROD_URL
        : process.env.FRONTEND_DEV_URL;

    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const emailTemplate = `
  <div style="border: 2px solid #8BD3E6; border-radius: 10px; padding: 20px; font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9FBFC;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #8BD3E6; font-size: 28px; margin: 0; font-weight: bold;">Reset Your Password</h1>
      <p style="color: #6C757D; font-size: 16px; margin: 5px 0 0;">We received a request to reset your password.</p>
    </div>
    <div style="padding: 20px; background: #FFFFFF; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
      <p style="color: #555555; font-size: 14px; line-height: 1.6;">
        You requested to reset your password. Please click the button below to proceed:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; font-size: 14px; font-weight: bold; color: #FFFFFF; background-color: #8BD3E6; border-radius: 5px; text-decoration: none;">
          RESET PASSWORD
        </a>
      </div>
      <p style="color: #6C757D; font-size: 12px; text-align: center; margin-top: 20px;">
        If you did not request this password reset, please ignore this email.
      </p>
    </div>
  </div>
`;

    await transporter.sendMail({
      from: '"N.A.S.I.R Music System" <nasir.music.system@gmail.com>',
      to: email,
      subject: "N.A.S.I.R: Password Reset",
      html: emailTemplate,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the JWT token
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    // Validate the new password
    const passwordRegex = /^(?=.*\d)[a-zA-Z\d]{8,}$/; // At least 8 characters, includes one number
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include a number",
      });
    }

    // Fetch the user by ID
    const user = await UserModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Send success response
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    // Token verification errors
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Generic server error
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.delete("/user/delete", async (req, res) => {
  const userId = req.session.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new document in the DeletedUser collection
    const deletedUser = new DeletedUserModel({
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      approval: user.approval,
      favorites_music: user.favorites_music,
      favorites_art: user.favorites_art,
      deletedAt: new Date(),
    });

    await deletedUser.save();

    await UserModel.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/clearSession", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to clear session", error: err });
      }
      res.json({ message: "Session Cleared" });
    });
  } else {
    res.json({ message: "No active session to clear" });
  }
});

// Update username only
app.put("/user/update-username", async (req, res) => {
  const { username } = req.body;

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username already exists
    const existingUser = await UserModel.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    user.username = username;
    await user.save();

    res.json({
      message: "Username updated successfully",
      user: {
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    });
  } catch (err) {
    console.error("Error updating username:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update password endpoint
app.put("/user/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate the new password
    const passwordRegex = /^(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include a number",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update profile picture only
app.put("/user/update-profile-picture", async (req, res) => {
  const { profile_picture_url } = req.body;

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profile_picture = profile_picture_url;
    await user.save();

    res.json({
      message: "Profile picture updated successfully",
      user: {
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    });
  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/current-user", isAuthenticated, (req, res) => {
  UserModel.findById(req.session.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error", error: err });
    });
});

// app.delete("/user/delete", async (req, res) => {
//   const userId = req.session.userId;

//   try {
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const user = await UserModel.findByIdAndDelete(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "Account deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

app.get("/search-music-scores", async (req, res) => {
  const { query } = req.query;

  try {
    let ABCFiles;

    if (query) {
      ABCFiles = await ABCFileModel.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { genre: { $regex: query, $options: "i" } },
          { emotion: { $regex: query, $options: "i" } },
          { composer: { $regex: query, $options: "i" } },
          { artist: { $regex: query, $options: "i" } },
          { instrumentation: { $regex: query, $options: "i" } },
        ],
      });
    }

    res.json(ABCFiles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/search-artworks", async (req, res) => {
  const { query } = req.query;

  try {
    let Artworks;

    if (query) {
      Artworks = await ArtworkModel.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { colletion: { $regex: query, $options: "i" } },
          { artist: { $regex: query, $options: "i" } },
        ],
      });
    }

    res.json(Artworks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post("/advanced-search", async (req, res) => {
  const { combinedQueries, selectedCollection } = req.body;

  console.log("Received combinedQueries:", combinedQueries);
  console.log("Received selectedCollection:", selectedCollection);

  let query = {};

  if (selectedCollection !== "All") {
    query.collection = selectedCollection;
  }

  let searchConditions = [];

  combinedQueries.forEach((row, index) => {
    let condition = {};
    let dbField;

    if (row.searchCategory && row.searchText) {
      switch (row.searchCategory) {
        case "Title":
          dbField = "title";
          condition[dbField] = { $regex: row.searchText, $options: "i" };
          break;
        case "Genre":
          dbField = "genre";
          condition[dbField] = { $regex: row.searchText, $options: "i" };
          break;
        case "Composer":
          dbField = "composer";
          condition[dbField] = { $regex: row.searchText, $options: "i" };
          break;
        case "Instrumentation":
          dbField = "instrumentation";
          condition[dbField] = { $regex: row.searchText, $options: "i" };
          break;
        case "Emotion":
          dbField = "emotion";
          condition[dbField] = { $regex: row.searchText, $options: "i" };
          break;
        case "All":
          searchConditions.push({
            $or: [
              { title: { $regex: row.searchText, $options: "i" } },
              { genre: { $regex: row.searchText, $options: "i" } },
              { composer: { $regex: row.searchText, $options: "i" } },
              { instrumentation: { $regex: row.searchText, $options: "i" } },
              { emotion: { $regex: row.searchText, $options: "i" } },
            ],
          });
          return;
        default:
          return;
      }
    }

    if (index > 0 && row.logic && row.logic !== "AND") {
      if (row.logic === "OR") {
        searchConditions.push({ [dbField]: condition[dbField] });
      } else if (row.logic === "NOT") {
        searchConditions.push({ [dbField]: { $not: condition[dbField] } });
      }
    } else {
      searchConditions.push(condition);
    }
  });

  if (searchConditions.length > 0) {
    if (searchConditions.length === 1) {
      query = searchConditions[0];
    } else if (searchConditions.length > 1) {
      query.$and = searchConditions;
    }
  }

  try {
    console.log(query);
    const results = await ABCFileModel.find(query);
    res.json(results);
  } catch (error) {
    console.error("Error searching music scores:", error);
    res.status(500).json({ error: "Failed to search music scores" });
  }
});

app.post("/artwork-advanced-search", async (req, res) => {
  const { combinedQueries, selectedCollection } = req.body;

  console.log("Received combinedQueries:", combinedQueries);
  console.log("Received selectedCollection:", selectedCollection);

  let query = {};

  // Handle collection filter separately
  if (selectedCollection && selectedCollection !== "All") {
    query.collection = selectedCollection;
  }

  let searchConditions = [];

  combinedQueries.forEach((row, index) => {
    if (row.searchCategory && row.searchText) {
      switch (row.searchCategory) {
        case "Title":
          searchConditions.push({
            title: { $regex: row.searchText, $options: "i" },
          });
          break;
        case "Artist":
          searchConditions.push({
            artist: { $regex: row.searchText, $options: "i" },
          });
          break;
        case "Collection":
          searchConditions.push({
            collection: { $regex: row.searchText, $options: "i" },
          });
          break;
        case "All":
          searchConditions.push({
            $or: [
              { title: { $regex: row.searchText, $options: "i" } },
              { artist: { $regex: row.searchText, $options: "i" } },
              { collection: { $regex: row.searchText, $options: "i" } },
            ],
          });
          break;
      }
    }
  });

  // Combine search conditions with collection filter
  if (searchConditions.length > 0) {
    if (searchConditions.length === 1) {
      // If there's only one condition, merge it with the collection filter
      if (query.collection) {
        query = { $and: [query, searchConditions[0]] };
      } else {
        query = searchConditions[0];
      }
    } else {
      // For multiple conditions, combine them with $and and then with collection filter
      const combinedSearch = { $and: searchConditions };
      if (query.collection) {
        query = { $and: [query, combinedSearch] };
      } else {
        query = combinedSearch;
      }
    }
  }

  try {
    console.log("Final query:", JSON.stringify(query, null, 2));
    const results = await ArtworkModel.find(query);
    res.json(results);
  } catch (error) {
    console.error("Error searching artworks:", error);
    res.status(500).json({ error: "Failed to search artworks" });
  }
});

app.post("/search", async (req, res) => {
  const { combinedQueries, selectedCollection } = req.body;

  let searchConditions = [];

  // Add collection filter if applicable
  if (selectedCollection !== "All") {
    searchConditions.push({ collection: selectedCollection });
  }

  combinedQueries.forEach((row, index) => {
    let condition = {};
    let dbField;

    if (row.category && row.text) {
      switch (row.category) {
        case "Title":
          dbField = "title";
          condition[dbField] = { $regex: row.text, $options: "i" };
          break;
        case "Genre":
          dbField = "genre";
          condition[dbField] = { $regex: row.text, $options: "i" };
          break;
        case "Composer":
          dbField = "composer";
          condition[dbField] = { $regex: row.text, $options: "i" };
          break;
        case "All":
          searchConditions.push({
            $or: [
              { title: { $regex: row.text, $options: "i" } },
              { genre: { $regex: row.text, $options: "i" } },
              { composer: { $regex: row.text, $options: "i" } },
            ],
          });
          return;
        default:
          return;
      }
    }

    if (index > 0 && row.logic && row.logic !== "AND") {
      if (row.logic === "OR") {
        searchConditions.push({ [dbField]: condition[dbField] });
      } else if (row.logic === "NOT") {
        searchConditions.push({ [dbField]: { $not: condition[dbField] } });
      }
    } else {
      searchConditions.push(condition);
    }
  });

  // Combine all conditions into the query
  let query = {};
  if (searchConditions.length > 0) {
    if (searchConditions.length === 1) {
      query = searchConditions[0];
    } else {
      query.$and = searchConditions;
    }
  }

  try {
    console.log(query); // For debugging
    const results = await ABCFileModel.find(query);
    res.json(results);
  } catch (error) {
    console.error("Error searching music scores:", error);
    res.status(500).json({ error: "Failed to search music scores" });
  }
});

app.post("/artwork-search", async (req, res) => {
  const { combinedQueries, selectedCollection } = req.body;

  let searchConditions = [];

  // Add collection filter if applicable
  if (selectedCollection !== "All") {
    searchConditions.push({ collection: selectedCollection });
  }

  combinedQueries.forEach((row, index) => {
    let condition = {};
    let dbField;

    if (row.category && row.text) {
      switch (row.category) {
        case "Title":
          dbField = "title";
          condition[dbField] = { $regex: row.text, $options: "i" };
          break;
        case "Artist":
          dbField = "artist";
          condition[dbField] = { $regex: row.text, $options: "i" };
          break;
        case "Collection":
          dbField = "collection";
          condition[dbField] = { $regex: row.text, $options: "i" };
          break;
        case "All":
          searchConditions.push({
            $or: [
              { title: { $regex: row.text, $options: "i" } },
              { artist: { $regex: row.text, $options: "i" } },
              { collection: { $regex: row.text, $options: "i" } },
            ],
          });
          return;
        default:
          return;
      }
    }

    if (index > 0 && row.logic && row.logic !== "AND") {
      if (row.logic === "OR") {
        searchConditions.push({ [dbField]: condition[dbField] });
      } else if (row.logic === "NOT") {
        searchConditions.push({ [dbField]: { $not: condition[dbField] } });
      }
    } else {
      searchConditions.push(condition);
    }
  });

  // Combine all conditions into the query
  let query = {};
  if (searchConditions.length > 0) {
    if (searchConditions.length === 1) {
      query = searchConditions[0];
    } else {
      query.$and = searchConditions;
    }
  }

  try {
    console.log(query); // For debugging
    const results = await ArtworkModel.find(query);
    res.json(results);
  } catch (error) {
    console.error("Error searching artworks:", error);
    res.status(500).json({ error: "Failed to search artworks." });
  }
});

app.get("/filter-music-scores", async (req, res) => {
  const { genre, composer, emotion, instrumentation } = req.query;

  try {
    const filter = {};

    if (genre) {
      filter.genre = genre;
    }

    if (composer) {
      filter.composer = { $regex: composer, $options: "i" };
    }

    if (instrumentation) {
      filter.instrumentation = { $regex: instrumentation, $options: "i" };
    }

    if (emotion) {
      filter.emotion = { $regex: emotion, $options: "i" };
    }

    const filteredScores = await ABCFileModel.find(filter);

    res.json(filteredScores);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/filter-artworks", async (req, res) => {
  try {
    const filter = {};

    for (const [key, value] of Object.entries(req.query)) {
      // Support multiple values (from checkboxes or multiselect dropdowns)
      if (Array.isArray(value)) {
        filter[key] = { $in: value };
      } else {
        filter[key] = { $in: [value] }; // Normalize single values to array
      }
    }

    const filteredArtworks = await ArtworkModel.find(filter);
    res.json(filteredArtworks);
  } catch (err) {
    console.error("Error filtering artworks:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post("/check-purchase", async (req, res) => {
  try {
    const { score_id, user_id } = req.body;

    // Validate input
    if (!score_id || !user_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing score_id or user_id" });
    }

    // Find matching documents in the purchases collection
    const purchases = await PurchaseModel.find({ score_id, user_id });

    if (purchases.length > 0) {
      return res.json({ success: true, exists: true, data: purchases });
    } else {
      return res.json({ success: true, exists: false, data: [] });
    }
  } catch (error) {
    console.error("Error checking purchase:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/check-artwork-purchase", async (req, res) => {
  try {
    const { artwork_id, user_id } = req.body;

    // Validate input
    if (!artwork_id || !user_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing artwork_id or user_id" });
    }

    const purchases = await Purchase2Model.find({ artwork_id, user_id });

    if (purchases.length > 0) {
      return res.json({ success: true, exists: true, data: purchases });
    } else {
      return res.json({ success: true, exists: false, data: [] });
    }
  } catch (error) {
    console.error("Error checking purchase:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/user-purchases", async (req, res) => {
  try {
    const userId = req.session.userId;

    const purchases = await PurchaseModel.find({ user_id: userId }).select(
      "score_id"
    );

    res.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases for the user:", error);
    res.status(500).send("Error fetching purchases for the user.");
  }
});

app.get("/user-artwork-purchases", async (req, res) => {
  try {
    const userId = req.session.userId;

    const purchases = await Purchase2Model.find({ user_id: userId }).select(
      "artwork_id"
    );

    res.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases for the user:", error);
    res.status(500).send("Error fetching purchases for the user.");
  }
});

app.get("/user-cart", async (req, res) => {
  try {
    const userId = req.session.userId;

    const cart = await CartModel.findOne({ user_id: userId });

    if (!cart || cart.score_ids.length === 0) {
      return res.json([]);
    }

    const cartItems = cart.score_ids.map((scoreId) => ({ score_id: scoreId }));

    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items for the user:", error);
    res.status(500).send("Error fetching cart items for the user.");
  }
});

app.get("/user-artwork-cart", async (req, res) => {
  try {
    const userId = req.session.userId;

    const cart = await Cart2Model.findOne({ user_id: userId });

    if (!cart || cart.artwork_ids.length === 0) {
      return res.json([]);
    }

    const cartItems = cart.artwork_ids.map((artworkId) => ({
      artwork_id: artworkId,
    }));

    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items for the user:", error);
    res.status(500).send("Error fetching cart items for the user.");
  }
});

// Get artwork by ID
app.get("/fetchArts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let artwork;
    if (mongoose.Types.ObjectId.isValid(id)) {
      artwork = await ArtworkModel.findById(id);
    } else {
      artwork = await ArtworkModel.findOne({ filename: id });
    }

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    res.status(200).json(artwork);
  } catch (err) {
    console.error("Error fetching artwork:", err);
    res
      .status(500)
      .json({ message: "Error fetching artwork", error: err.message });
  }
});

app.get("/check-purchase/:artwork_id", async (req, res) => {
  try {
    const { artwork_id } = req.params;
    const userId = req.session.userId;

    // Find purchase in purchase2 collection
    const purchase = await Purchase2Model.findOne({
      user_id: userId,
      artwork_id: artwork_id,
    });

    res.status(200).json({
      hasPurchased: !!purchase,
      purchase,
    });
  } catch (err) {
    console.error("Error checking purchase:", err);
    res.status(500).json({
      message: "Error checking purchase status",
      error: err.message,
    });
  }
});

app.get("/download-artwork", async (req, res) => {
  try {
    const { imageUrl } = req.query;

    // Verify user has permission to download
    // (Add your authentication/authorization logic here)

    const response = await axios.get(imageUrl, {
      responseType: "stream",
    });

    // Set appropriate headers
    res.setHeader("Content-Disposition", `attachment; filename="artwork.jpg"`);
    res.setHeader("Content-Type", response.headers["content-type"]);

    response.data.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send("Download failed");
  }
});

app.post("/add-to-cart", async (req, res) => {
  try {
    const userId = req.session.userId;
    const { musicScoreId } = req.body;

    let cart = await CartModel.findOne({ user_id: userId });

    if (!cart) {
      cart = new CartModel({ user_id: userId, score_ids: [musicScoreId] });
    } else {
      // If the cart exists, append the new music score ID
      if (!cart.score_ids.includes(musicScoreId)) {
        cart.score_ids.push(musicScoreId);
      }
    }

    await cart.save();
    res.status(200).json({ message: "Score added to cart" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).send("Error updating cart.");
  }
});

app.post("/add-to-cart-artwork", async (req, res) => {
  try {
    const userId = req.session.userId;
    const { artworkId } = req.body;

    let cart = await Cart2Model.findOne({ user_id: userId });

    if (!cart) {
      cart = new Cart2Model({ user_id: userId, artwork_ids: [artworkId] });
    } else {
      // If the cart exists, append the new music score ID
      if (!cart.artwork_ids.includes(artworkId)) {
        cart.artwork_ids.push(artworkId);
      }
    }

    await cart.save();
    res.status(200).json({ message: "Artwork added to cart." });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).send("Error updating cart.");
  }
});

app.post("/submit-rating", async (req, res) => {
  const { rating, scoreId, userId } = req.body;

  try {
    // Update the database with the rating
    await PurchaseModel.findOneAndUpdate(
      { score_id: scoreId, user_id: userId }, // Find the relevant document
      { $set: { ratingGiven: rating } }, // Update the rating
      { new: true } // Return the updated document
    );

    res.status(200).json({ success: true, message: "Rating submitted!" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/submit-artwork-rating", async (req, res) => {
  const { rating, artworkId, userId } = req.body;

  try {
    await Purchase2Model.findOneAndUpdate(
      { artwork_id: artworkId, user_id: userId }, // Find the relevant document
      { $set: { ratingGiven: rating } }, // Update the rating
      { new: true } // Return the updated document
    );

    res.status(200).json({ success: true, message: "Rating submitted!" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/remove-item-from-cart/:id", async (req, res) => {
  try {
    const userId = req.session.userId;
    const scoreId = req.params.id;

    // Find the user's cart and remove the scoreId from the score_ids array
    const cart = await CartModel.findOneAndUpdate(
      { user_id: userId },
      { $pull: { score_ids: scoreId } },
      { new: true } // Return the updated cart
    );

    if (!cart) {
      return res.status(404).json({ message: "No cart found for the user." });
    }

    res.json(cart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).send("Error removing item from cart.");
  }
});

app.delete("/remove-artwork-from-cart/:id", async (req, res) => {
  try {
    const userId = req.session.userId;
    const artworkId = req.params.id;

    // Find the user's cart and remove the scoreId from the score_ids array
    const cart = await Cart2Model.findOneAndUpdate(
      { user_id: userId },
      { $pull: { artwork_ids: artworkId } },
      { new: true } // Return the updated cart
    );

    if (!cart) {
      return res.status(404).json({ message: "No cart found for the user." });
    }

    res.json(cart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).send("Error removing item from cart.");
  }
});

app.get("/music-score/:id", async (req, res) => {
  try {
    const scoreId = req.params.id;

    const musicScore = await ABCFileModel.findById(scoreId);

    if (!musicScore) {
      return res.status(404).json({ message: "Music score not found" });
    }

    res.json(musicScore);
  } catch (error) {
    console.error("Error fetching music score:", error);
    res.status(500).send("Error fetching music score.");
  }
});

app.get("/artwork/:id", async (req, res) => {
  try {
    const artworkId = req.params.id;

    const artwork = await ArtworkModel.findById(artworkId);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    res.json(artwork);
  } catch (error) {
    console.error("Error fetching artwork:", error);
    res.status(500).send("Error fetching artwork.");
  }
});

app.get("/music-scores", async (req, res) => {
  try {
    const scoreIds = req.query.scoreIds;

    if (!scoreIds) {
      return res.status(400).json({ message: "No score IDs provided" });
    }

    let scoreIdArray;

    if (Array.isArray(scoreIds)) {
      scoreIdArray = scoreIds;
    } else if (typeof scoreIds === "string") {
      scoreIdArray = scoreIds.split(",");
    } else {
      return res.status(400).json({ message: "Invalid score IDs format" });
    }

    const musicScores = await ABCFileModel.find({
      _id: { $in: scoreIdArray },
    });

    if (musicScores.length === 0) {
      return res.status(404).json({ message: "No music scores found" });
    }

    res.json(musicScores);
  } catch (error) {
    console.error("Error fetching music scores:", error);
    res.status(500).send("Error fetching music scores.");
  }
});

app.get("/artworks", async (req, res) => {
  try {
    const artworkIds = req.query.artworkIds;

    if (!artworkIds) {
      return res.status(400).json({ message: "No score IDs provided" });
    }

    let artworkIdArray;

    if (Array.isArray(artworkIds)) {
      artworkIdArray = artworkIds;
    } else if (typeof artworkIds === "string") {
      artworkIdArray = artworkIds.split(",");
    } else {
      return res.status(400).json({ message: "Invalid score IDs format" });
    }

    const artworks = await ArtworkModel.find({
      _id: { $in: artworkIdArray },
    });

    if (artworks.length === 0) {
      return res.status(404).json({ message: "No music scores found" });
    }

    res.json(artworks);
  } catch (error) {
    console.error("Error fetching music scores:", error);
    res.status(500).send("Error fetching music scores.");
  }
});

app.get("/popular-music-scores", async (req, res) => {
  try {
    const popularScores = await ABCFileModel.find()
      .sort({ downloads: -1 })
      .limit(10);

    res.json(popularScores);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/popular-artworks", async (req, res) => {
  try {
    const popularArtworks = await ArtworkModel.find()
      .sort({ downloads: -1 })
      .limit(10);

    res.json(popularArtworks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/user-liked-scores", async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await UserModel.findById(userId);

    if (!user || !user.favorites_music || user.favorites_music.length === 0) {
      return res.status(404).json({ message: "No liked scores found" });
    }

    const likedScores = await ABCFileModel.find({
      _id: { $in: user.favorites_music },
    });

    res.json(likedScores);
  } catch (error) {
    console.error("Error fetching liked music scores:", error);
    res.status(500).json({ message: "Error fetching liked music scores." });
  }
});

app.get("/user-liked-artworks", async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await UserModel.findById(userId);

    if (!user || !user.favorites_art || user.favorites_art.length === 0) {
      return res.status(404).json({ message: "No liked arts found" });
    }

    const likedArtworks = await ArtworkModel.find({
      _id: { $in: user.favorites_art },
    });

    res.json(likedArtworks);
  } catch (error) {
    console.error("Error fetching liked artworks:", error);
    res.status(500).json({ message: "Error fetching liked artworks." });
  }
});

app.get("/user-composed-scores", async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await UserModel.findById(userId);

    if (
      !user ||
      !user.composed_score_ids ||
      user.composed_score_ids.length === 0
    ) {
      return res.status(404).json({ message: "No composed scores found" });
    }

    const composedScores = await ABCFileModel.find({
      _id: { $in: user.composed_score_ids },
    });

    res.json(composedScores);
  } catch (error) {
    console.error("Error fetching liked music scores:", error);
    res.status(500).json({ message: "Error fetching liked music scores." });
  }
});

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

app.post("/set-favorites-artwork", async (req, res) => {
  const userId = req.session.userId;
  const { artworkId, action } = req.body;

  if (!mongoose.Types.ObjectId.isValid(artworkId)) {
    return res.status(400).json({ message: "Invalid artworkId format" });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "add") {
      if (!user.favorites_art.includes(artworkId)) {
        user.favorites_art.push(artworkId);
      }
    } else if (action === "remove") {
      user.favorites_art = user.favorites_art.filter(
        (favId) => favId.toString() !== artworkId
      );
    } else {
      return res.status(400).json({ message: "Invalid action specified" });
    }

    await user.save();

    res.json({
      message: "Favorite updated successfully",
      favorites_art: user.favorites_art,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/customer-music-score-view/:id", async (req, res) => {
  try {
    const musicScore = await ABCFileModel.findById(req.params.id);
    if (!musicScore) {
      return res.status(404).json({ message: "Music score not found" });
    }
    res.json(musicScore);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/customer-artwork-view/:id", async (req, res) => {
  try {
    const artwork = await ArtworkModel.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }
    res.json(artwork);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/api/image-path", async (req, res) => {
  try {
    const score = await ABCFileModel.findOne();
    res.json({ path: score.coverImageUrl });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.get("/api/image-path-artwork", async (req, res) => {
  try {
    const artwork = await ArtworkModel.findOne();
    res.json({ path: artwork.imageUrl });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

const calculateRecommendations = async (userId) => {
  try {
    // Get user and their preferences
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get all available scores
    let allScores = await ABCFileModel.find({});

    // Calculate scores for each music piece based on user preferences
    const scoredMusic = allScores.map((music) => {
      let score = 0;
      let matchCount = 0;

      // Check composer preference match (highest weight: 0.4)
      if (user.composer_preferences.includes(music.composer)) {
        score += 0.4;
        matchCount++;
      }

      // Check genre preference match (weight: 0.35)
      if (user.genre_preferences.includes(music.genre)) {
        score += 0.35;
        matchCount++;
      }

      // Check emotion preference match (weight: 0.25)f
      if (user.emotion_preferences.includes(music.emotion)) {
        score += 0.25;
        matchCount++;
      }

      // Bonus points for multiple matches
      if (matchCount > 1) {
        score += 0.1 * matchCount;
      }

      // Avoid recommending music that's already in favorites
      if (user.favorites_music.includes(music._id)) {
        score = 0;
      }

      return {
        score,
        musicData: music,
      };
    });

    // Sort by score and get top recommendations
    const sortedRecommendations = scoredMusic
      .sort((a, b) => b.score - a.score)
      .filter((item) => item.score > 0) // Only include items with matches
      .map((item) => item.musicData);

    // Limit to 10 recommendations but ensure variety
    const recommendations = [];
    const usedGenres = new Set();
    let index = 0;

    while (
      recommendations.length < 10 &&
      index < sortedRecommendations.length
    ) {
      const currentScore = sortedRecommendations[index];

      // Ensure genre diversity in recommendations
      if (!usedGenres.has(currentScore.genre) || usedGenres.size >= 5) {
        recommendations.push(currentScore);
        usedGenres.add(currentScore.genre);
      }

      index++;
    }

    // If we have fewer than 10 recommendations, fill with popular items
    if (recommendations.length < 10) {
      const popularMusicScores = await ABCFileModel.find({
        _id: {
          $nin: [...recommendations.map((r) => r._id), ...user.favorites_music],
        },
      })
        .sort({ downloads: -1 })
        .limit(10 - recommendations.length);

      recommendations.push(...popularMusicScores);
    }

    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
};

const calculateArtworkRecommendations = async (userId) => {
  try {
    // Get user and their preferences
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get all available scores
    let allArtworks = await ArtworkModel.find({});

    // Calculate scores for each music piece based on user preferences
    const scoredArtwork = allArtworks.map((artwork) => {
      let score = 0;
      let matchCount = 0;

      // Check composer preference match (highest weight: 0.4)
      if (user.collection_preferences.includes(artwork.collection)) {
        score += 0.4;
        matchCount++;
      }

      // Check genre preference match (weight: 0.35)
      if (user.artist_preferences.includes(artwork.artist)) {
        score += 0.35;
        matchCount++;
      }

      // Bonus points for multiple matches
      if (matchCount > 1) {
        score += 0.1 * matchCount;
      }

      // Avoid recommending music that's already in favorites
      if (user.favorites_art.includes(artwork._id)) {
        score = 0;
      }

      return {
        score,
        artworkData: artwork,
      };
    });

    // Sort by score and get top recommendations
    const sortedRecommendations = scoredArtwork
      .sort((a, b) => b.score - a.score)
      .filter((item) => item.score > 0) // Only include items with matches
      .map((item) => item.artworkData);

    // Limit to 10 recommendations but ensure variety
    const recommendations = [];
    const usedArtist = new Set();
    let index = 0;

    while (
      recommendations.length < 10 &&
      index < sortedRecommendations.length
    ) {
      const currentArtwork = sortedRecommendations[index];

      // Ensure genre diversity in recommendations
      if (!usedArtist.has(currentArtwork.genre) || usedArtist.size >= 5) {
        recommendations.push(currentArtwork);
        usedArtist.add(currentArtwork.genre);
      }

      index++;
    }

    // If we have fewer than 10 recommendations, fill with popular items
    if (recommendations.length < 10) {
      const popularArtworks = await ArtworkModel.find({
        _id: {
          $nin: [...recommendations.map((r) => r._id), ...user.favorites_art],
        },
      })
        .sort({ downloads: -1 })
        .limit(10 - recommendations.length);

      recommendations.push(...popularArtworks);
    }

    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
};

app.get("/recommendations", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const recommendations = await calculateRecommendations(req.session.userId);
    res.json(recommendations);
  } catch (error) {
    console.error("Error in recommendations endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/artwork-recommendations", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const recommendations = await calculateArtworkRecommendations(
      req.session.userId
    );
    res.json(recommendations);
  } catch (error) {
    console.error("Error in recommendations endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const fulfillOrder = async (session) => {
  const userId = session.client_reference_id;
  const cartItems = session.display_items;

  const purchaseItems = cartItems.map((item) => ({
    user_id: mongoose.Types.ObjectId(userId),
    purchase_date: new Date(),
    price: item.amount_total / 100,
    score_id: mongoose.Types.ObjectId(item._id),
    ratingGiven: 0,
  }));

  // Add to purchases collection
  await Purchase.insertMany(purchaseItems);

  // Remove the purchased score_ids from the user's cart
  await Cart.updateOne(
    { user_id: mongoose.Types.ObjectId(userId) },
    { $pull: { score_ids: { $in: purchaseItems.map((i) => i.score_id) } } }
  );
};

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      await fulfillOrder(session);
    }

    res.json({ received: true });
  }
);

app.post("/create-checkout-session", async (req, res) => {
  let userId = req.session.userId;
  userId = userId.toString();

  const { cartItems } = req.body;

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "myr",
      product_data: {
        name: item.title,
      },
      unit_amount: parseFloat(item.price) * 100,
    },
    quantity: 1,
  }));

  const frontendUrl =
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_PROD_URL
      : process.env.FRONTEND_DEV_URL;

  const paymentSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${frontendUrl}/success`,
    cancel_url: `${frontendUrl}/cancel`,
    client_reference_id: userId,
  });

  res.json({ id: paymentSession.id });
});

app.post("/create-checkout-session-artwork", async (req, res) => {
  let userId = req.session.userId;
  userId = userId.toString();

  const { cartItems } = req.body;

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "myr",
      product_data: {
        name: item.title,
      },
      unit_amount: parseFloat(item.price) * 100,
    },
    quantity: 1,
  }));

  const frontendUrl =
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_PROD_URL
      : process.env.FRONTEND_DEV_URL;

  const paymentSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${frontendUrl}/success-2`,
    cancel_url: `${frontendUrl}/cancel`,
    client_reference_id: userId,
  });

  res.json({ id: paymentSession.id });
});

app.post("/complete-purchase", async (req, res) => {
  const userId = req.session.userId;

  try {
    const cart = await CartModel.findOne({ user_id: userId });

    if (!cart || cart.score_ids.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const purchaseItems = await Promise.all(
      cart.score_ids.map(async (score_id) => {
        const musicScore = await ABCFileModel.findById(score_id);
        if (!musicScore) {
          throw new Error(`Music score with ID ${score_id} not found`);
        }

        return {
          user_id: userId,
          purchase_date: new Date(),
          price: parseFloat(musicScore.price), // Convert string to number
          score_id: score_id,
        };
      })
    );

    // Insert purchase items
    await PurchaseModel.insertMany(purchaseItems);

    // After saving the cart, check for duplicates
    for (const item of purchaseItems) {
      const { user_id, score_id } = item;

      // Find duplicates with the same user_id and score_id
      const duplicates = await PurchaseModel.find({
        user_id,
        score_id,
      });

      if (duplicates.length > 1) {
        // Delete one of the duplicates (you can adjust the deletion logic as needed)
        const duplicateToDelete = duplicates[1]; // Keep the first one, delete the second
        await PurchaseModel.deleteOne({ _id: duplicateToDelete._id });
      }
    }

    // Clear the cart
    cart.score_ids = [];
    await cart.save();

    res.json({ message: "Purchase completed successfully" });
  } catch (error) {
    console.error("Error completing purchase:", error);
    res.status(500).json({ message: "Failed to complete purchase" });
  }
});

app.post("/complete-purchase-artwork", async (req, res) => {
  const userId = req.session.userId;

  try {
    const cart = await Cart2Model.findOne({ user_id: userId });

    if (!cart || cart.artwork_ids.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const purchaseItems = await Promise.all(
      cart.artwork_ids.map(async (artwork_id) => {
        const artwork = await ArtworkModel.findById(artwork_id);
        if (!artwork) {
          throw new Error(`Music score with ID ${artwork_id} not found`);
        }

        return {
          user_id: userId,
          purchase_date: new Date(),
          price: parseFloat(artwork.price), // Convert string to number
          artwork_id: artwork_id,
        };
      })
    );

    // Insert purchase items
    await Purchase2Model.insertMany(purchaseItems);

    // After saving the cart, check for duplicates
    for (const item of purchaseItems) {
      const { user_id, artwork_id } = item;

      // Find duplicates with the same user_id and score_id
      const duplicates = await Purchase2Model.find({
        user_id,
        artwork_id,
      });

      if (duplicates.length > 1) {
        // Delete one of the duplicates (you can adjust the deletion logic as needed)
        const duplicateToDelete = duplicates[1]; // Keep the first one, delete the second
        await Purchase2Model.deleteOne({ _id: duplicateToDelete._id });
      }
    }

    // Clear the cart
    cart.artwork_ids = [];
    await cart.save();

    res.json({ message: "Purchase completed successfully" });
  } catch (error) {
    console.error("Error completing purchase:", error);
    res.status(500).json({ message: "Failed to complete purchase" });
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log("\n🚀 =================================");
  console.log(`   Mozartify Main API Server`);
  console.log("🚀 =================================");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Backend URL: https://mozartify.onrender.com`);
  console.log(`🎨 Frontend URL: https://mozartify-frontend.onrender.com`);
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

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
