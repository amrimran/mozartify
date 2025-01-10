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

const UserModel = require("./models/User");
const PurchaseModel = require("./models/Purchase");
const CartModel = require("./models/Cart");
const DeletedUserModel = require("./models/DeletedUser");
const ABCFileModel = require("./models/ABCFile");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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

mongoose.connect(process.env.DB_URI);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = (email, username, token) => {
  const url = `http://localhost:3000/verify-email?token=${token}`;
  const emailTemplate = `
    <div style="border: 2px solid #483C32; border-radius: 10px; padding: 20px; font-family: Arial, sans-serif; width: 600px; margin: 0 auto;">
      <div style="text-align: center;">
        <h1 style="color: #483C32;">Mozartify</h1>
      </div>
      <div style="padding: 20px; text-align: left;">
        <p>Hi <strong>${username}</strong>,</p>
        <p>Thank you for registering with Mozartify! Please verify your email address to complete your registration.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; border-radius: 5px; background-color: #483C32; color: #FFFFFF; text-decoration: none;">Verify Email</a>
      </div>
    </div>
  `;

  transporter.sendMail(
    {
      from: "Mozartify",
      to: email,
      subject: "Mozartify Email Verification",
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
    <div style="border: 2px solid #483C32; border-radius: 10px; padding: 20px; font-family: Arial, sans-serif; width: 600px; margin: 0 auto;">
      <div style="text-align: center;">
        <h1 style="color: #483C32;">Mozartify</h1>
      </div>
      <div style="padding: 20px; text-align: left;">
        <p>Admin,</p>
        <p>A new user has requested to become a Music Entry Clerk.</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Please review and approve their request in the admin panel.</p>
      </div>
    </div>
  `;

  transporter.sendMail(
    {
      from: "Mozartify",
      to: adminEmail,
      subject: "New Music Entry Clerk Approval Needed",
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

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
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

    const newUser = new UserModel({
      username,
      email,
      password,
      role,
      approval: role === "customer" ? "approved" : "pending",
      first_timer: true,
    });

    await newUser.save();

    if (role === "customer") {
      const token = jwt.sign(
        { username, email, password, role },
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
    const { username, email, password, role } = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.approval === false) {
      return res
        .status(400)
        .json({ message: "Your account is pending approval" });
    }

    res.json({ message: "Email verified and user registered" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

app.post("/login", async (req, res) => {
  const { username_or_email, password } = req.body;

  try {
    const user = await UserModel.findOne({
      $or: [{ email: username_or_email }, { username: username_or_email }],
    });

    if (user) {
      if (user.password === password) {
        req.session.userId = user._id;
        req.session.save((err) => {
          if (err) {
            console.log("Session save error:", err);
            return res
              .status(500)
              .json({ message: "Session save error", error: err });
          }
          res.json({
            message: "Success",
            userId: user._id,
            role: user.role,
            first_timer: user.first_timer,
          });
        });
      } else {
        res.status(400).json({ message: "The password is incorrect" });
      }
    } else {
      res.status(400).json({ message: "No record existed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
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

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5m", // Set token expiration to 5 minutes
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    const emailTemplate = `
      <div>
        <p>You requested for a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
      </div>
    `;

    await transporter.sendMail({
      from: "Mozartify",
      to: email,
      subject: "Password Reset",
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
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
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
      favorites: user.favorites,
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
    const existingUser = await UserModel.findOne({ username, _id: { $ne: userId } });
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
        profile_picture: user.profile_picture
      }
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

    // Simple string comparison since password is stored as plain text
    if (currentPassword !== user.password) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update with new password (as plain string)
    user.password = newPassword;
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
        profile_picture: user.profile_picture
      }
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

app.delete("/user/delete", async (req, res) => {
  const userId = req.session.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

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

app.post("/search", async (req, res) => {
  const { combinedQueries, selectedCollection } = req.body;

  let query = {};

  if (selectedCollection !== "All") {
    query.collection = selectedCollection;
  }

  let searchConditions = [];

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

app.get("/popular-music-scores", async (req, res) => {
  try {
    const popularScores = await ABCFileModel.find()
      .sort({ view_count: -1 })
      .limit(10);

    res.json(popularScores);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/user-liked-scores", async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await UserModel.findById(userId);

    if (!user || !user.favorites || user.favorites.length === 0) {
      return res.status(404).json({ message: "No liked scores found" });
    }

    const likedScores = await ABCFileModel.find({
      _id: { $in: user.favorites },
    });

    res.json(likedScores);
  } catch (error) {
    console.error("Error fetching liked music scores:", error);
    res.status(500).json({ message: "Error fetching liked music scores." });
  }
});

app.post("/set-favorites", async (req, res) => {
  const userId = req.session.userId;
  const { musicScoreId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favorites.includes(musicScoreId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(
        (favId) => favId.toString() !== musicScoreId
      );
    } else {
      user.favorites.push(musicScoreId);
    }

    await user.save();

    res.json({
      message: "Favorite updated successfully",
      favorites: user.favorites,
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

app.get("/api/image-path", async (req, res) => {
  try {
    const score = await ABCFileModel.findOne();
    res.json({ path: score.coverImageUrl });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

let cachedRecommendations = {};

app.get("/recommendations", async (req, res) => {
  try {
    const sessionId = req.sessionID;

    if (!req.session.userId) {
      return res.status(401).json({ error: "User not logged in" });
    }

    if (cachedRecommendations[sessionId]) {
      return res.json(cachedRecommendations[sessionId]);
    }

    const user = await UserModel.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { genre_preferences, composer_preferences, emotion_preferences } =
      user;

    let allScores = await ABCFileModel.find({
      $or: [
        { genre: { $in: genre_preferences } },
        { composer: { $in: composer_preferences } },
        { emotion: { $in: emotion_preferences } },
      ],
    });

    const limit = Math.min(allScores.length, 10);
    let recommendedScores = [];

    for (let i = 0; i < limit; i++) {
      const randomIndex = Math.floor(Math.random() * allScores.length);
      recommendedScores.push(allScores[randomIndex]);
      allScores.splice(randomIndex, 1);
    }

    // Cache the recommendations for this session
    cachedRecommendations[sessionId] = recommendedScores;

    res.json(recommendedScores);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const fulfillOrder = async (session) => {
  const userId = session.client_reference_id; // Ensure this is passed during checkout creation
  const cartItems = session.display_items;

  const purchaseItems = cartItems.map((item) => ({
    user_id: mongoose.Types.ObjectId(userId),
    purchase_date: new Date(),
    price: item.amount_total / 100,
    score_id: mongoose.Types.ObjectId(item._id), // Assuming each item in cart has a `custom_id` representing the `score_id`
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

  const paymentSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `http://localhost:5173/success`,
    cancel_url: `http://localhost:5173/cancel`,
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

    await PurchaseModel.insertMany(purchaseItems);

    cart.score_ids = [];
    await cart.save();

    res.json({ message: "Purchase completed successfully" });
  } catch (error) {
    console.error("Error completing purchase:", error);
    res.status(500).json({ message: "Failed to complete purchase" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
