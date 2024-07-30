const mongoose = require('mongoose');

const DeletedUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'music_entry_clerk'], default: 'customer' },
  approval: { type: Boolean, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MusicScore' }],
  deletedAt: { type: Date, default: Date.now },
});

const DeletedUserModel = mongoose.model('DeletedUser', DeletedUserSchema);
module.exports = DeletedUserModel;
