const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart2Schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  artwork_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Artwork'
    }
  ]
});


const Cart2 = mongoose.model('Cart2', Cart2Schema, 'carts2');
module.exports = Cart2;
