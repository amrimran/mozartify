const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'music_entry_clerk'], default: 'customer' },
  approval: { type: Boolean, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MusicScore' }],
  first_timer: { type: Boolean, required: true, default: true },
  composer_preferences: [{ type: String }],
  genre_preferences: [{ type: String }],
  emotion_preferences: [{ type: String }]
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
