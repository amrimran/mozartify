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
  favorites_music: [{ type: mongoose.Schema.Types.ObjectId, ref: "MusicScore" }], // References to favorite MusicScore objects
  favorites_art: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }], // References to favorite Artwork objects
  music_first_timer: {
    type: Boolean,
    required: true,
    default: true,
  },
  art_first_timer: {
    type: Boolean,
    required: true,
    default: true,
  },
  failedLoginAttempts: { type: Number, default: 0 }, // To track login attempts
  lockUntil: { type: Date, default: null }, // Lockout period
  sessionId: { type: String, default: null }, // To track active session
  composer_preferences: [{ type: String }], // List of preferred composers
  genre_preferences: [{ type: String }], // List of preferred genres
  emotion_preferences: [{ type: String }], // List of preferred emotions
  artist_preferences: [{ type: String }], // List of preferred emotions
  collection_preferences: [{ type: String }], // List of preferred emotions
  composed_score_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Score' }],
  created_art_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Art' }]
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
