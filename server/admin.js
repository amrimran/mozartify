require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ABCFile = require("./models/ABCFile");
const Feedback = require("./models/Feedback");
const User = require("./models/User");
const DeletedUser = require("./models/DeletedUser");
const Purchase = require("./models/Purchase");

const bcrypt = require("bcryptjs");

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
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

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

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the email or username already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this username or email already exists",
      });
    }

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create the user object with hashed password
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Store hashed password
      role, // Store user role
    });

    // Save the new user
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error creating user:", error.message);

    // Handle MongoDB unique constraint errors
    if (error.code === 11000) {
      // Determine which field caused the duplication
      const duplicateField = Object.keys(error.keyPattern).join(", ");
      res.status(400).json({
        error: `Duplicate entry for ${duplicateField}. A user with this ${duplicateField} already exists.`,
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
      return res
        .status(400)
        .json({ error: "Username, email, and role are required" });
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
        error:
          "Duplicate entry. A user with this email or username already exists.",
      });
    } else {
      res.status(500).json({ error: "Failed to update user" });
    }
  }
});

app.post("/api/feedback/reply/:id", async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage) {
    return res.status(400).json({ error: "Reply message is required" });
  }

  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      {
        replyMessage,
        replyDate: new Date(), // Set the current date
      },
      { new: true } // Return the updated document
    );

    if (!updatedFeedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: "Failed to add reply" });
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
      return res
        .status(400)
        .json({ error: "User already exists in deletedusers" });
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

    const existingDeletedUser = await DeletedUser.findOne({
      email: user.email,
    });
    if (!existingDeletedUser) {
      const deletedUser = new DeletedUser(user.toObject());
      await deletedUser.save();
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message:
        "User deleted successfully and transferred to deletedusers collection",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Fetch total statistics for dashboard
app.get("/admin/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" }); // Filter by role
    const totalUploads = await ABCFile.countDocuments();

    const totalPurchases = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);
    const purchaseCount =
      totalPurchases.length > 0 ? totalPurchases[0].total : 0;


    // Aggregate uploads by month
    const uploadsByMonth = await ABCFile.aggregate([
      {
        $group: {
          _id: { $month: "$dateUploaded" }, // Group by month
          count: { $sum: 1 }, // Count uploads per month
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    // Aggregate purchases by month
    const purchasesByMonth = await Purchase.aggregate([
      {
        $group: {
          _id: { $month: "$purchase_date" }, // Group by month
          count: { $sum: 1 }, // Count purchases per month
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    // Prepare monthly stats for response
    const monthlyUploads = Array(12).fill(0);
    const monthlyPurchases = Array(12).fill(0);

    uploadsByMonth.forEach((upload) => {
      monthlyUploads[upload._id - 1] = upload.count; // _id is the month number (1-12)
    });

    purchasesByMonth.forEach((purchase) => {
      monthlyPurchases[purchase._id - 1] = purchase.count; // _id is the month number (1-12)
    });

    res.json({
      totalUsers,
      totalUploads,
      totalPurchases: purchaseCount,
      monthlyUploads,
      monthlyPurchases,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});


app.get("/admin/feedbacks", async (req, res) => {
  try {
    // Fetch all feedbacks with status "pending"
    const pendingFeedbacks = await Feedback.find({ status: "pending" });
    const totalPendingFeedbacks = pendingFeedbacks.length;

    // Respond with both the count and the feedbacks
    res.status(200).json({ feedbacks: pendingFeedbacks, totalFeedbacks: totalPendingFeedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
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
