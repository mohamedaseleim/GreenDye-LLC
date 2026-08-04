const express = require('express');
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Create a new chat session
router.post('/sessions', protect, chatController.createSession);

// Send a message in a chat session
router.post('/:sessionId/messages', protect, chatController.sendMessage);

// Get messages from a chat session
router.get('/:sessionId/messages', protect, chatController.getMessages);

// Get all chat conversations
router.get('/conversations', protect, chatController.getConversations);

module.exports = router;
