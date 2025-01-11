const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_picture: { type: String, required: false },
  role: {
    type: String,
    enum: ["customer", "music_entry_clerk", "admin"], // Added 'admin' role
    default: "customer",
  },
  approval: {
    type: String,
    enum: ["approved", "pending", "denied"], // Updated approval field to string with predefined values
    default: "pending", // Default is 'pending' for new users
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "MusicScore" }], // References to favorite MusicScore objects
  first_timer: {
    type: Boolean,
    required: true,
    default: true,
  }, // Indicates if the user is logging in for the first time
  failedLoginAttempts: { type: Number, default: 0 }, // To track login attempts
  lockUntil: { type: Date, default: null }, // Lockout period
  sessionId: { type: String, default: null }, // To track active session
  composer_preferences: [{ type: String }], // List of preferred composers
  genre_preferences: [{ type: String }], // List of preferred genres
  emotion_preferences: [{ type: String }], // List of preferred emotions
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
