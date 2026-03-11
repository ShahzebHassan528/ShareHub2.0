/**
 * Message Controller (MVC Pattern)
 * Handles messaging-related HTTP requests
 */

const Message = require('../models/Message.sequelize.wrapper');
const User = require('../models/User.sequelize.wrapper');
const NotificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class MessageController {
  /**
   * Send message
   * POST /api/v1/messages/send
   */
  static sendMessage = catchAsync(async (req, res, next) => {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;

    // Validation
    if (!receiver_id) {
      return next(new AppError('Receiver ID is required', 400));
    }

    if (!message || message.trim().length === 0) {
      return next(new AppError('Message cannot be empty', 400));
    }

    if (message.length > 5000) {
      return next(new AppError('Message too long (max 5000 characters)', 400));
    }

    // Cannot send message to yourself
    if (sender_id === parseInt(receiver_id)) {
      return next(new AppError('Cannot send message to yourself', 400));
    }

    // Send message
    const newMessage = await Message.sendMessage(sender_id, receiver_id, message);

    // Create notification for receiver (non-blocking)
    try {
      const sender = await User.findById(sender_id);
      await NotificationService.notifyMessageReceived(receiver_id, sender.full_name);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  });

  /**
   * Get conversation with specific user
   * GET /api/v1/messages/conversation/:userId
   */
  static getConversation = catchAsync(async (req, res, next) => {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Validation
    if (isNaN(otherUserId)) {
      return next(new AppError('Invalid user ID', 400));
    }

    if (currentUserId === otherUserId) {
      return next(new AppError('Cannot get conversation with yourself', 400));
    }

    // Get conversation
    const messages = await Message.getConversation(currentUserId, otherUserId, {
      limit,
      offset
    });

    // Mark messages as read
    await Message.markConversationAsRead(currentUserId, otherUserId);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        limit,
        offset,
        count: messages.length
      }
    });
  });

  /**
   * Get all chat conversations
   * GET /api/v1/messages/chats
   */
  static getUserChats = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const chats = await Message.getUserChats(userId);

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  });

  /**
   * Mark message as read
   * PUT /api/v1/messages/read/:id
   */
  static markAsRead = catchAsync(async (req, res, next) => {
    const messageId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(messageId)) {
      return next(new AppError('Invalid message ID', 400));
    }

    await Message.markAsRead(messageId, userId);

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  });

  /**
   * Get unread message count
   * GET /api/v1/messages/unread-count
   */
  static getUnreadCount = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const count = await Message.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  });

  /**
   * Delete message
   * DELETE /api/v1/messages/:id
   */
  static deleteMessage = catchAsync(async (req, res, next) => {
    const messageId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(messageId)) {
      return next(new AppError('Invalid message ID', 400));
    }

    await Message.deleteMessage(messageId, userId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  });

  /**
   * Search messages
   * GET /api/v1/messages/search
   */
  static searchMessages = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const searchTerm = req.query.q;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return next(new AppError('Search term is required', 400));
    }

    if (searchTerm.length < 2) {
      return next(new AppError('Search term must be at least 2 characters', 400));
    }

    const messages = await Message.searchMessages(userId, searchTerm);

    res.status(200).json({
      success: true,
      count: messages.length,
      search_term: searchTerm,
      data: messages
    });
  });
}

module.exports = MessageController;
