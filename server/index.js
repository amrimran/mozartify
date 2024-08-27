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

const UserModel = require("./models/User");
const PurchaseModel = require("./models/Purchase");
const CartModel = require("./models/Cart");
const MusicScoreModel = require("./models/MusicScore");
const DeletedUserModel = require("./models/DeletedUser");


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
  const { username, email, password, role = "customer" } = req.body;

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
      approval: role === "customer",
    });
    await newUser.save();

    if (role === "customer") {
      const token = jwt.sign(
        { username, email, password, role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
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
    res.status(500).json({ message: "Server error", error: err });
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
    const collection = db.collection(collectionName);

    const updateResult = await collection.updateOne(
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
      expiresIn: "1h",
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

app.put("/user/update", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    if (password) {
      user.password = password;
    }

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
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
    let musicScores;

    if (query) {
      musicScores = await MusicScoreModel.find({
        $or: [
          { ms_title: { $regex: query, $options: "i" } },
          { ms_genre: { $regex: query, $options: "i" } },
          { ms_emotion: { $regex: query, $options: "i" } },
          { ms_composer: { $regex: query, $options: "i" } },
          { ms_artist: { $regex: query, $options: "i" } },
          { ms_instrumentation: { $regex: query, $options: "i" } },
        ],
      });
    }

    res.json(musicScores);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/filter-music-scores", async (req, res) => {
  const { genre, composer, emotion, instrumentation } = req.query;

  try {
    const filter = {};

    if (genre) {
      filter.ms_genre = genre;
    }

    if (composer) {
      filter.ms_composer = { $regex: composer, $options: "i" };
    }

    if (instrumentation) {
      filter.ms_instrumentation = { $regex: instrumentation, $options: "i" };
    }

    if (emotion) {
      filter.ms_emotion = { $regex: emotion, $options: "i" };
    }

    const filteredScores = await MusicScoreModel.find(filter);

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
      return res.status(404).json({ message: "No items found in the user's cart." });
    }

    const cartItems = cart.score_ids.map(scoreId => ({ score_id: scoreId }));

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

app.delete('/remove-item-from-cart/:id', async (req, res) => {
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


app.get('/music-score/:id', async (req, res) => {
  try {
    const scoreId = req.params.id;

    // Find the music score by its ID
    const musicScore = await MusicScoreModel.findById(scoreId);

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

    const musicScores = await MusicScoreModel.find({
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
    const popularScores = await MusicScoreModel.find()
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

    const likedScores = await MusicScoreModel.find({ _id: { $in: user.favorites } });

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
    const musicScore = await MusicScoreModel.findById(req.params.id);
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
    const image = await MusicScoreModel.findOne();
    res.json({ path: image.ms_cover_image });
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

    // Check if recommendations for this session are already cached
    if (cachedRecommendations[sessionId]) {
      return res.json(cachedRecommendations[sessionId]);
    }

    const user = await UserModel.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { genre_preferences, composer_preferences, emotion_preferences } =
      user;

    // Fetch music scores based on user's preferences
    let allScores = await MusicScoreModel.find({
      $or: [
        { ms_genre: { $in: genre_preferences } },
        { ms_composer: { $in: composer_preferences } },
        { ms_emotion: { $in: emotion_preferences } },
      ],
    });

    // Randomly pick up to 10 music scores from the matched results
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
