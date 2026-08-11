const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isGuest: { type: Boolean, default: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  items: [orderItemSchema],
  subtotal: Number,
  taxes: Number,
  deliveryFee: Number,
  total: Number,
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryTime: { type: String, default: 'now' },
  instructions: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
