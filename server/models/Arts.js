const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({
  filename: { type: String },
  title: { type: String },
  artist: { type: String },
  price: { type: String },
  collection: { type: String },
  dateUploaded: { type: Date },
  imageUrl: { type: String },
  downloads: { type: Number },
});

const Artwork = mongoose.model("Artwork", ArtworkSchema);

module.exports = Artwork;
