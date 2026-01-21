const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'QR code key is required'],
    unique: true,
    trim: true,
    index: true
  },
  number: {
    type: String,
    required: [true, 'QR code number is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'QR code value is required'],
    unique: true,
    trim: true,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  questionLink: {
    type: String,
    default: '',
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  time: {
    type: String,
    required: [true, 'Time limit is required'],
    default: '5'
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    default: 50
  },
  scans: {
    type: Number,
    default: 0,
    min: 0
  },
  maxScans: {
    type: Number,
    required: [true, 'Max scans is required'],
    min: [1, 'Max scans must be at least 1'],
    default: 10
  },
  queimagename: {
    type: String,
    default: '',
    trim: true
  },
  round: {
    type: Number,
    default: 1,
    index: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
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
qrCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('QRCode', qrCodeSchema);


