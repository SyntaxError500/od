const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team ID is required'],
    index: true
  },
  qrValue: {
    type: String,
    required: [true, 'QR value is required'],
    trim: true,
    index: true
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    index: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  // Ensure a team can only answer each QR code once
  indexes: [
    { teamId: 1, qrValue: 1 }, { unique: true }
  ]
});

module.exports = mongoose.model('Answer', answerSchema);


