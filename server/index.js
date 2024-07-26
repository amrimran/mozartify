require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const UserModel = require("./models/User");
const MusicScoreModel = require("./models/MusicScore");

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

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
          console.log("Session set successfully:", req.session.userId);
          res.json({ message: "Success", userId: user._id, role: user.role, isActive: user.isActive});
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



app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out", error: err });
    }
    res.json({ message: "Logged out successfully" });
    console.log("babyyy");
  });
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

app.put("/user/deactivate", async (req, res) => {
  const userId = req.session.userId;
  
  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;  // Assuming you have an isActive field in your schema
    await user.save();
    res.json({ message: "Account deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/music-scores", async (req, res) => {
  const { userId } = req.query;

  try {
    let musicScores;
    if (userId) {
      musicScores = await MusicScoreModel.find({ ownerIds: userId });
    } else {
      musicScores = await MusicScoreModel.find();
    }
    res.json(musicScores);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post("/favourites", async (req, res) => {
  const { userId, musicScoreId } = req.body;

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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
