// Define SMS schema (for storing received messages)
const mongoose = require('mongoose');

const SMSSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SMS', SMSSchema);
