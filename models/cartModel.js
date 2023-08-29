const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        count: Number,
        color: String,
        price: Number,
        title: String,
        description: String,
      },
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    state: {
      type: String,
      default: 'processing',
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model('Cart', cartSchema);
