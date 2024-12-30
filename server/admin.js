require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // e.g., customer, music_entry_clerk, admin
  approval: { type: String, enum: ["approved", "pending", "denied"], default: "approved" },
  favorites: { type: [String], default: [] },
  composer_preferences: { type: [String], default: [] },
  emotion_preferences: { type: [String], default: [] },
  genre_preferences: { type: [String], default: [] },
  first_timer: { type: Boolean, default: true },
});

// Add a compound index to ensure unique username + role and email + role
userSchema.index({ username: 1, role: 1 }, { unique: true });
userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);


const deletedUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  approval: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now },
});

const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Admin API is running");
});

// Fetch all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Fetch user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save the user directly; compound index ensures uniqueness
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error creating user:", error.message);

    // Handle MongoDB unique constraint errors
    if (error.code === 11000) {
      // Determine which field caused the duplication
      const duplicateField = Object.keys(error.keyPattern).join(", ");
      res.status(400).json({
        error: `Duplicate entry for ${duplicateField}. A user with this ${duplicateField} and role already exists.`,
      });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { username, email, role, approval } = req.body;

    // Validate fields
    if (!username || !email || !role) {
      return res.status(400).json({ error: "Username, email, and role are required" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle MongoDB unique constraint errors
    if (error.code === 11000) {
      res.status(400).json({
        error: "Duplicate entry. A user with this email or username already exists.",
      });
    } else {
      res.status(500).json({ error: "Failed to update user" });
    }
  }
});



// Add user to deletedusers
app.post("/deletedusers", async (req, res) => {
  try {
    const { username, email, password, role, approval, deletedAt } = req.body;

    if (!username || !email || !password || !role || !approval) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingDeletedUser = await DeletedUser.findOne({ email });
    if (existingDeletedUser) {
      return res.status(400).json({ error: "User already exists in deletedusers" });
    }

    const deletedUser = new DeletedUser({
      username,
      email,
      password,
      role,
      approval,
      deletedAt: deletedAt || new Date(),
    });

    const savedDeletedUser = await deletedUser.save();
    res.status(201).json(savedDeletedUser);
  } catch (error) {
    console.error("Error adding to deletedusers:", error);
    res.status(500).json({ error: "Failed to add user to deletedusers" });
  }
});

// Update user details
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.put("/users/:id/approval", async (req, res) => {
  try {
    const { approval } = req.body;
    if (!["approved", "pending", "denied"].includes(approval)) {
      return res.status(400).json({ error: "Invalid approval status" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { approval },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({ error: "Failed to update approval status" });
  }
});


// Delete a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingDeletedUser = await DeletedUser.findOne({ email: user.email });
    if (!existingDeletedUser) {
      const deletedUser = new DeletedUser(user.toObject());
      await deletedUser.save();
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully and transferred to deletedusers collection" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
