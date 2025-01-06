require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const Feedback = require("./models/Feedback");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());

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

const upload = multer();

mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {});

app.post("/api/feedback", upload.none(), async (req, res) => {
  const { username, title, detail, user_id } = req.body;
  const attachment_url = req.body["attachment_url"];

  const feedback = new Feedback({
    username,
    title,
    detail,
    attachment_url: attachment_url,
    user_id,
  });

  try {
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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

app.delete("/api/feedback/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(3002, () => {
  console.log(`Server is running on port 3002`);
});
