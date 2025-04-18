const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({
  imageUrl: { type: String },
  downloads: { type: Number },
  dynamicFieldValues: [{
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DynamicField'
    },
    value: String
  }]
});

const Artwork = mongoose.model("Artwork", ArtworkSchema);

module.exports = Artwork;
