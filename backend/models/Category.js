const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for global categories
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  icon: {
    type: String,
    default: 'Tag'
  },
  color: {
    type: String,
    default: 'hsl(200, 75%, 50%)'
  }
});

module.exports = mongoose.model('Category', categorySchema);
