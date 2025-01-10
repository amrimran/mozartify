const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  score_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "MusicScore",
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

const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
