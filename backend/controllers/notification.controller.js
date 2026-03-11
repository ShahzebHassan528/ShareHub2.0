/**
 * Notification Controller (MVC Pattern)
 * Handles notification-related HTTP requests
 */

const NotificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class NotificationController {
  /**
   * Get user notifications
   * GET /api/v1/notifications
   */
  static getUserNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const unreadOnly = req.query.unread === 'true';
    
    const notifications = await NotificationService.getUserNotifications(userId, unreadOnly);
    const unreadCount = await NotificationService.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      unread_count: unreadCount,
      data: notifications
    });
  });

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread-count
   */
  static getUnreadCount = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      unread_count: count
    });
  });

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/read/:id
   */
  static markAsRead = catchAsync(async (req, res, next) => {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const success = await NotificationService.markAsRead(notificationId, userId);
    
    if (!success) {
      return next(new AppError('Notification not found or unauthorized', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification_id: notificationId
    });
  });

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   */
  static markAllAsRead = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const count = await NotificationService.markAllAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      count
    });
  });
}

module.exports = NotificationController;
