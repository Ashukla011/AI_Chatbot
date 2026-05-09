const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: 'You are a helpful and contextual AI assistant.',
});

// Send message and get AI response
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content = '', image } = req.body;
    const userId = req.user;

    // Save user message with optional image
    const userMessage = new Message({
      user: userId,
      role: 'user',
      content,
      image: image && image.mimeType && image.data ? {
        mimeType: image.mimeType,
        data: image.data,
      } : undefined,
    });
    await userMessage.save();

    // Retrieve last 10 messages for context
    const history = await Message.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(11)
      .lean();

    const formattedHistory = history.reverse().map((msg) => {
      const parts = [];
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      if (msg.image && msg.image.data && msg.image.mimeType) {
        parts.push({ inlineData: { mimeType: msg.image.mimeType, data: msg.image.data } });
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: parts.length ? parts : [{ text: '' }],
      };
    });

    // Start chat with history
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Send the new message with optional image
    const sendContent = [];
    if (content) sendContent.push(content);
    if (image && image.data && image.mimeType) {
      sendContent.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
    }

    const result = await chat.sendMessage(sendContent.length === 1 ? sendContent[0] : sendContent);
    const aiContent = result.response.text();

    // Save AI response
    const aiMessage = new Message({
      user: userId,
      role: 'assistant',
      content: aiContent,
    });
    await aiMessage.save();

    res.json({ content: aiContent });
  } catch (err) {
    console.error(err);
    let errorMessage = 'AI Chat Error';
    if (err.message && err.message.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later or upgrade your plan.';
    } else if (err.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment before sending another message.';
    } else if (err.status === 400) {
      errorMessage = 'Invalid request. Please check your message and try again.';
    }
    res.status(500).json({ message: errorMessage });
  }
});

// Get chat history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await Message.find({ user: req.user })
      .sort({ timestamp: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router;
