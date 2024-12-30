const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  score_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ABCFile'
    }
  ]
});


const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
