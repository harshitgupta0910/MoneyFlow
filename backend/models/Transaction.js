const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: function() { return this.type !== 'transfer'; }
  },
  division: {
    type: String,
    required: function() { return this.type !== 'transfer'; },
    default: 'Personal'
  },
  account: {
    type: String,
    required: true
  },
  // Transfer specific fields
  toAccount: {
    type: String,
    required: function() { return this.type === 'transfer'; }
  },
  fromAccount: {
    type: String,
    required: function() { return this.type === 'transfer'; }
  },
  dateTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Index for faster queries
transactionSchema.index({ userId: 1, dateTime: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
