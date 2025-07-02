const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true
  },
  opens: {
    type: Number,
    default: 0
  },
  userIp: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const Tracking = mongoose.model('Tracking', trackingSchema);
module.exports = Tracking;
