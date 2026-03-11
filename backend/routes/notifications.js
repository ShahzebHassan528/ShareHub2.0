const express = require('express');
const { authenticate } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

const router = express.Router();

console.log('🔧 Notification routes initialized');

/**
 * GET /api/notifications
 * Get all notifications for authenticated user
 * Query params: unread=true (optional) - get only unread notifications
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadOnly = req.query.unread === 'true';
    
    console.log(`📋 Fetching notifications for user ${userId}${unreadOnly ? ' (unread only)' : ''}`);
    
    const notifications = await NotificationService.getUserNotifications(userId, unreadOnly);
    const unreadCount = await NotificationService.getUnreadCount(userId);
    
    res.json({
      message: 'Notifications retrieved successfully',
      count: notifications.length,
      unread_count: unreadCount,
      notifications
    });
    
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);
    
    res.json({
      unread_count: count
    });
    
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * PUT /api/notifications/read/:id
 * Mark a specific notification as read
 */
router.put('/read/:id', authenticate, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;
    
    console.log(`✅ Marking notification ${notificationId} as read for user ${userId}`);
    
    const success = await NotificationService.markAsRead(notificationId, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }
    
    res.json({
      message: 'Notification marked as read',
      notification_id: notificationId
    });
    
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for authenticated user
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`✅ Marking all notifications as read for user ${userId}`);
    
    const count = await NotificationService.markAllAsRead(userId);
    
    res.json({
      message: 'All notifications marked as read',
      count
    });
    
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

module.exports = router;
