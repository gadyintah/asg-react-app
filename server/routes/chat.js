// server/routes/chat.js
const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');

// GET: Retrieve chat history
router.get('/history', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: 1 }).limit(50); //Sort by timestamp and limit to 50 messages
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// POST: Save a new chat message
router.post('/save', async (req, res) => {
  try {
    const { sender, content, attachment } = req.body;
    const newMessage = new ChatMessage({ sender, content, attachment, timestamp: new Date() });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save chat message' });
  }
});

module.exports = router;
