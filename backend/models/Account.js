const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  type: {
    type: String,
    enum: ['cash', 'bank', 'credit', 'investment'],
    required: true
  },
  color: {
    type: String,
    default: 'hsl(200, 75%, 50%)'
  },
  icon: {
    type: String,
    default: 'Wallet'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema);
