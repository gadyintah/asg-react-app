const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  attachment: {
    name: { type: String },
    data: { type: String }, // Base64 string
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
