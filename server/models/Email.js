const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  data: String, // Base64 encoded file data
  mimetype: String,
});

const EmailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  from: { type: String, required: true },
  subject: { type: String, required: true },
  text: { type: String, required: true },
  attachments: [AttachmentSchema], // Store multiple attachments
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Email", EmailSchema);
