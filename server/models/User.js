const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  addresses: [{
    street: String,
    city: String,
    state: String,
    pincode: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
