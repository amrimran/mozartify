// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const Feedback = require("./models/Feedback");
const Feedback2 = require("./models/Feedback2");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();
app.use(express.json());

// ================== ENVIRONMENT CONFIG ==================
const isProduction = process.env.NODE_ENV === "production";

// ================== CORS CONFIGURATION ==================
const allowedOrigins = [
  // Frontend URLs
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,
  
  // Backend URLs (for internal communication)
  process.env.BACKEND_PROD_URL,
  process.env.BACKEND_DEV_URL,
  
  // Development URLs
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:10000',
  
  // Add future Render URLs (you'll get these after deployment)
  'https://mozartify-backend.onrender.com',
  'https://mozartify-frontend.onrender.com',
  
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

const disableSessions = process.env.DISABLE_SESSIONS === 'true';

if (!disableSessions) {
  const store = new MongoDBStore({
    uri: process.env.DB_URI,
    collection: "sessions",
  });

  store.on("error", (error) => {
    console.log(error);
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: "lax",
        httpOnly: true,
      },
    })
  );
} else {
  // Use memory store (sessions won't persist)
  console.log("⚠️ Sessions disabled - using memory store");
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'fallback-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: "lax",
        httpOnly: true,
      },
    })
  );
}

const upload = multer();

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.DB_URI)
    .then(() => {
      console.log('📊 MongoDB connected successfully');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
    });
} else {
  console.log('📊 MongoDB already connected');
}

// Submit Feedback endpoint for customer
app.post("/api/feedback", upload.none(), async (req, res) => {
  const { username, title, detail, user_id, attachment_url } = req.body;

  const feedback = new Feedback({
    username,
    title,
    detail,
    attachment_url,
    user_id,
    status: "pending", // Set default status
  });

  try {
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/artwork-feedback", upload.none(), async (req, res) => {
  const { username, title, detail, user_id, attachment_url } = req.body;

  const feedback2 = new Feedback2({
    username,
    title,
    detail,
    attachment_url,
    user_id,
    status: "pending", // Set default status
  });

  try {
    const savedFeedback = await feedback2.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user id-based feedbacks endpoint for customer
app.get("/api/feedback", async (req, res) => {
  const { userId } = req.query;

  try {
    let feedbacks;
    if (userId) {
      feedbacks = await Feedback.find({ user_id: userId });
    } else {
      feedbacks = await Feedback.find();
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/api/artwork-feedback", async (req, res) => {
  const { userId } = req.query;

  try {
    let feedbacks;
    if (userId) {
      feedbacks = await Feedback2.find({ user_id: userId });
    } else {
      feedbacks = await Feedback2.find();
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get all feedbacks endpoint for admin
app.get("/api/feedback/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find(); // Fetch all feedbacks
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Delete feedback endpoint
app.delete("/api/feedback/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/artwork-feedback/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback2.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update reply endpoint
app.post("/api/feedback/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const updateFields = {
      $push: {
        replies: {
          message,
          date: new Date(),
          sender: sender || "customer",
        },
      },
    };

    // Only update the unread status of the other party
    if (sender === "customer") {
      updateFields.$set = { isReadAdmin: false };
    } else if (sender === "admin") {
      updateFields.$set = { isReadCustomer: false };
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error in reply endpoint:", error);
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/artwork-feedback/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const updateFields = {
      $push: {
        replies: {
          message,
          date: new Date(),
          sender: sender || "customer",
        },
      },
    };

    // Only update the unread status of the other party
    if (sender === "customer") {
      updateFields.$set = { isReadAdmin: false };
    } else if (sender === "admin") {
      updateFields.$set = { isReadCustomer: false };
    }

    const updatedFeedback = await Feedback2.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error in reply endpoint:", error);
    res.status(400).json({ message: error.message });
  }
});

// New endpoint to update feedback status (admin only)
app.patch("/api/feedback/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/artwork-feedback/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedFeedback = await Feedback2.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/feedback/:id/mark-read-customer", async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { isReadCustomer: true });
    res.json({ message: "Feedback marked as read by customer" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.put("/api/artwork-feedback/:id/mark-read-customer", async (req, res) => {
  try {
    await Feedback2.findByIdAndUpdate(req.params.id, { isReadCustomer: true });
    res.json({ message: "Feedback marked as read by customer" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.put("/api/feedback/:id/mark-read-admin", async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { isReadAdmin: true });
    res.json({ message: "Feedback marked as read by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.put("/api/artwork-feedback/:id/mark-read-admin", async (req, res) => {
  try {
    await Feedback2.findByIdAndUpdate(req.params.id, { isReadAdmin: true });
    res.json({ message: "Feedback marked as read by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3002; // Use different ports for each
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 Server running on port ${PORT}`);
  });
}

module.exports = app;

