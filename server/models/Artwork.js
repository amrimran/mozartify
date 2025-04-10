const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  artist: { type: String, required: true},
  price: { type: String, required: true },
  collection: { type: String, required: true },
  dateUploaded: { type: Date, required: true },
  imageUrl: { type: String, required: true },
});

const ArtworkModel = mongoose.model("Artwork", ArtworkSchema);

module.exports = ArtworkModel;
