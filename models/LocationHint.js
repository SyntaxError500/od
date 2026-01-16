const mongoose = require('mongoose');

const locationHintSchema = new mongoose.Schema({
  round: {
    type: Number,
    required: [true, 'Round number is required'],
    unique: true,
    index: true,
    min: [1, 'Round must be at least 1']
  },
  hints: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
locationHintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LocationHint', locationHintSchema);


