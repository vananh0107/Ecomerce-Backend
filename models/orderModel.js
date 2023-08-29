const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String,
      default: new Date().getMonth(),
    },
    shippingInfor: {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      voucher: {
        type: String,
      },
      district: {
        type: String,
        required: true,
      },
      methodPayment: {
        type: String,
        required: true,
      },
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    paidAt: {
      type: Date,
      default: Date.now(),
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalPriceAfterDiscount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      default: 'Ordered',
    },
  },
  {
    timestraps: true,
  }
);
//Export the model
module.exports = mongoose.model('Order', orderSchema);
