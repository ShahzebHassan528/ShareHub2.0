/**
 * Notification Routes (MVC Pattern)
 * Uses NotificationController for all notification endpoints
 */

const express = require('express');
const router = express.Router();
const NotificationController = require('../../controllers/notification.controller');
const { authenticate } = require('../../middleware/auth');

console.log('🔧 Notification routes initialized with MVC pattern (NotificationController)');

// GET /api/v1/notifications - Get user notifications
router.get('/', authenticate, NotificationController.getUserNotifications);

// GET /api/v1/notifications/unread-count - Get unread count
router.get('/unread-count', authenticate, NotificationController.getUnreadCount);

// PUT /api/v1/notifications/read/:id - Mark notification as read
router.put('/read/:id', authenticate, NotificationController.markAsRead);

// PUT /api/v1/notifications/read-all - Mark all as read
router.put('/read-all', authenticate, NotificationController.markAllAsRead);

module.exports = router;
