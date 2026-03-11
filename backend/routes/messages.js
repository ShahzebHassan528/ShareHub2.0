/**
 * Message Routes
 * 
 * Handles all messaging functionality
 * All routes are protected with JWT authentication
 */

const express = require('express');
const { auth } = require('../middleware/auth');
const Message = require('../models/Message.sequelize.wrapper');
const NotificationService = require('../services/notificationService');
const User = require('../models/User.sequelize.wrapper');

const router = express.Router();

console.log('🔧 Message routes initialized with Sequelize ORM');

/**
 * POST /api/messages/send
 * Send a message to another user
 * Body: { receiver_id, message }
 */
router.post('/send', auth, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;

    console.log('📨 Send message request:', {
      sender: sender_id,
      receiver: receiver_id
    });

    // Validation
    if (!receiver_id) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
    }

    // Cannot send message to yourself
    if (sender_id === parseInt(receiver_id)) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Send message
    const newMessage = await Message.sendMessage(sender_id, receiver_id, message);

    // Create notification for receiver
    try {
      const sender = await User.findById(sender_id);
      await NotificationService.notifyMessageReceived(receiver_id, sender.full_name);
    } catch (notifError) {
      console.error('⚠️  Failed to create notification:', notifError.message);
      // Don't fail the request if notification fails
    }

    console.log('✅ Message sent successfully');

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /api/messages/conversation/:userId
 * Get conversation with a specific user
 * Query params: limit, offset
 */
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    console.log('💬 Get conversation request:', {
      currentUser: currentUserId,
      otherUser: otherUserId,
      limit,
      offset
    });

    // Validation
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({ error: 'Cannot get conversation with yourself' });
    }

    // Get conversation
    const messages = await Message.getConversation(currentUserId, otherUserId, {
      limit,
      offset
    });

    // Mark messages as read
    await Message.markConversationAsRead(currentUserId, otherUserId);

    console.log(`✅ Retrieved ${messages.length} messages`);

    res.json({
      message: 'Conversation retrieved successfully',
      data: messages,
      pagination: {
        limit,
        offset,
        count: messages.length
      }
    });
  } catch (error) {
    console.error('❌ Get conversation error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

/**
 * GET /api/messages/chats
 * Get all chat conversations for current user
 */
router.get('/chats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📋 Get chats request for user:', userId);

    // Get all chats
    const chats = await Message.getUserChats(userId);

    console.log(`✅ Retrieved ${chats.length} chat conversations`);

    res.json({
      message: 'Chats retrieved successfully',
      data: chats
    });
  } catch (error) {
    console.error('❌ Get chats error:', error);
    res.status(500).json({ error: 'Failed to retrieve chats' });
  }
});

/**
 * PUT /api/messages/read/:id
 * Mark a specific message as read
 */
router.put('/read/:id', auth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = req.user.id;

    console.log('✓ Mark as read request:', {
      messageId,
      userId
    });

    // Validation
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    // Mark as read
    await Message.markAsRead(messageId, userId);

    console.log('✅ Message marked as read');

    res.json({
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

/**
 * GET /api/messages/unread-count
 * Get count of unread messages for current user
 */
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('🔔 Get unread count request for user:', userId);

    const count = await Message.getUnreadCount(userId);

    console.log(`✅ User has ${count} unread messages`);

    res.json({
      message: 'Unread count retrieved successfully',
      data: { count }
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

/**
 * DELETE /api/messages/:id
 * Delete a message (only sender can delete)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = req.user.id;

    console.log('🗑️  Delete message request:', {
      messageId,
      userId
    });

    // Validation
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    // Delete message
    await Message.deleteMessage(messageId, userId);

    console.log('✅ Message deleted');

    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete message error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * GET /api/messages/search
 * Search messages by content
 * Query params: q (search term)
 */
router.get('/search', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const searchTerm = req.query.q;

    console.log('🔍 Search messages request:', {
      userId,
      searchTerm
    });

    // Validation
    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    if (searchTerm.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }

    // Search messages
    const messages = await Message.searchMessages(userId, searchTerm);

    console.log(`✅ Found ${messages.length} matching messages`);

    res.json({
      message: 'Search completed successfully',
      data: messages,
      search_term: searchTerm
    });
  } catch (error) {
    console.error('❌ Search messages error:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

module.exports = router;
