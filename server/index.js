const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const UserModel = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/mozartify");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "amirimran728@gmail.com",
    pass: "roazgjmptmdzwibi",
  },
});

const sendVerificationEmail = (email, token) => {
  const url = `http://localhost:3001/verify-email?token=${token}`;
  transporter.sendMail({
    from: "amirimran728@gmail.com",
    to: email,
    subject: "Verify your email",
    html: `Click <a href="${url}">here</a> to verify your email.`,
  });
};

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

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

    const token = jwt.sign({ username, email, password }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    sendVerificationEmail(email, token);

    res.json({ message: "Verification email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const { username, email, password } = jwt.verify(token, "your_jwt_secret");

    const newUser = new UserModel({ username, email, password });
    await newUser.save();

    res.json({ message: "Email verified and user registered" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
