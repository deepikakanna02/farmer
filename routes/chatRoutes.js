const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrGetChat, getChat, addMessage, getUserChats } = require('../controllers/chatController');

router.get('/', protect, getUserChats);           // GET /api/chat  → my conversations list
router.post('/', protect, createOrGetChat);        // POST /api/chat → create or get chat
router.get('/:conversationId', protect, getChat);  // GET /api/chat/:id → get single chat
router.post('/message', protect, addMessage);      // POST /api/chat/message → send message

module.exports = router;
