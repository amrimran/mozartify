const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  title: { type: String, required: true, unique: true },
  artist: { type: String, required: true},
  price: { type: String, required: true },
  collection: { type: String, required: true },
  imageUrl: { type: String, required: true },
  medium: { type: String, required: false},
  partner: { type: String, required: false},
  downloads: { type: Number, required: false},
});

const ArtworkModel = mongoose.model("Artwork", ArtworkSchema, "artworks");
module.exports = ArtworkModel;