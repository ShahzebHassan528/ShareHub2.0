/**
 * Message Routes (MVC Pattern)
 * Uses MessageController for all messaging endpoints
 */

const express = require('express');
const router = express.Router();
const MessageController = require('../../controllers/message.controller');
const { authenticate } = require('../../middleware/auth');

console.log('🔧 Message routes initialized with MVC pattern (MessageController)');

// POST /api/v1/messages/send - Send message
router.post('/send', authenticate, MessageController.sendMessage);

// GET /api/v1/messages/conversation/:userId - Get conversation
router.get('/conversation/:userId', authenticate, MessageController.getConversation);

// GET /api/v1/messages/chats - Get all chats
router.get('/chats', authenticate, MessageController.getUserChats);

// PUT /api/v1/messages/read/:id - Mark message as read
router.put('/read/:id', authenticate, MessageController.markAsRead);

// GET /api/v1/messages/unread-count - Get unread count
router.get('/unread-count', authenticate, MessageController.getUnreadCount);

// DELETE /api/v1/messages/:id - Delete message
router.delete('/:id', authenticate, MessageController.deleteMessage);

// GET /api/v1/messages/search - Search messages
router.get('/search', authenticate, MessageController.searchMessages);

module.exports = router;
