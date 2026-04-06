const express = require('express');
const OpenAI = require('openai');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Send message and get AI response
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user;

    // Save user message
    const userMessage = new Message({
      user: userId,
      role: 'user',
      content,
    });
    await userMessage.save();

    // Retrieve last 10 messages for context
    const history = await Message.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(11) // Last 10 + current
      .lean();

    const formattedHistory = history.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // OpenAI Chat Completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful and contextual AI assistant.' },
        ...formattedHistory,
      ],
    });

    const aiContent = response.choices[0].message.content;

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
    res.status(500).json({ message: 'AI Chat Error' });
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
