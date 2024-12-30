const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'music_entry_clerk', 'admin'], // Added 'admin' role
    default: 'customer',
  },
  approval: {
    type: String,
    enum: ['approved', 'pending', 'denied'], // Updated approval field to string with predefined values
    default: 'pending', // Default is 'false' for new users
  },
  favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'MusicScore' },
  ], // References to favorite MusicScore objects
  first_timer: {
    type: Boolean,
    required: true,
    default: true,
  }, // Indicates if the user is logging in for the first time
  composer_preferences: [{ type: String }], // List of preferred composers
  genre_preferences: [{ type: String }], // List of preferred genres
  emotion_preferences: [{ type: String }], // List of preferred emotions
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
