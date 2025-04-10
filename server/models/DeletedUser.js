const mongoose = require('mongoose');

const DeletedUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'music_entry_clerk', 'admin'], default: 'customer' },
  approval: {
    type: String,
    enum: ['approved', 'pending', 'denied'], // Updated approval field to string with predefined values
    default: 'pending', // Default is 'pending' for new users
  },    favorites_music: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MusicScore' }],
  favorites_art: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
  deletedAt: { type: Date, default: Date.now },
});

const DeletedUserModel = mongoose.model('DeletedUser', DeletedUserSchema);
module.exports = DeletedUserModel;
