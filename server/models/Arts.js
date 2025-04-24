const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({
  // Common fields directly in the schema
  title: { type: String },
  artist: { type: String },
  price: { type: String },
  collection: { type: String },
  dateUploaded: { type: Date, default: Date.now },
  imageUrl: { type: String },
  downloads: { type: Number, default: 0 },
  
  // Track when the document was created and last updated
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Soft delete flag
  deleted: { type: Boolean, default: false }
}, { 
  strict: false,  // This allows for dynamic properties not defined in the schema
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Pre-save middleware to update the updatedAt timestamp
ArtworkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Artwork = mongoose.model("Artwork", ArtworkSchema, "artworks");

module.exports = Artwork;