const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchase2Schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  artwork_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Artwork",
  },
  purchase_date: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  ratingGiven: {
    type: Number,
    default: null, // Default is `null` if no rating is given
    min: 0,
    max: 5, // Restrict the range to 0-5 for valid ratings
  },
});

const Purchase2 = mongoose.model("Purchase2", purchase2Schema, "purchases2");
module.exports = Purchase2;