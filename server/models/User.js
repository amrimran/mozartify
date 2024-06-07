const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'music_entry_clerk'], default: 'customer' },
  approval: { type: Boolean, default: false } // Default to false for new users
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
