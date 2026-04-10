/**
 * Notification Service
 * Centralized service for creating and managing notifications
 */

const { Notification: NotificationModel } = require('../database/models');

class NotificationService {
  /**
   * Create a notification
   * @param {number} userId - User ID to receive notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (optional)
   * @returns {Promise<Object>} Created notification
   */
  static async createNotification(userId, title, message, type = null) {
    try {
      console.log(`📬 Creating notification for user ${userId}: ${title}`);
      
      const notification = await NotificationModel.create({
        user_id: userId,
        title,
        message,
        type,
        is_read: false
      });
      
      console.log(`✅ Notification created: ID ${notification.id}`);
      return notification.toJSON();
    } catch (error) {
      console.error('❌ Error creating notification:', error.message);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   * @param {number} userId - User ID
   * @param {boolean} unreadOnly - Get only unread notifications
   * @returns {Promise<Array>} Array of notifications
   */
  static async getUserNotifications(userId, unreadOnly = false) {
    try {
      const whereClause = { user_id: userId };
      
      if (unreadOnly) {
        whereClause.is_read = false;
      }
      
      const notifications = await NotificationModel.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        raw: true
      });
      
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error.message);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<boolean>} Success status
   */
  static async markAsRead(notificationId, userId) {
    try {
      const [affectedRows] = await NotificationModel.update(
        { is_read: true },
        { 
          where: { 
            id: notificationId,
            user_id: userId // Ensure user owns this notification
          } 
        }
      );
      
      return affectedRows > 0;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error.message);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  static async markAllAsRead(userId) {
    try {
      const [affectedRows] = await NotificationModel.update(
        { is_read: true },
        { 
          where: { 
            user_id: userId,
            is_read: false
          } 
        }
      );
      
      return affectedRows;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error.message);
      throw error;
    }
  }

  /**
   * Get unread notification count
   * @param {number} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  static async getUnreadCount(userId) {
    try {
      const count = await NotificationModel.count({
        where: {
          user_id: userId,
          is_read: false
        }
      });
      
      return count;
    } catch (error) {
      console.error('❌ Error getting unread count:', error.message);
      throw error;
    }
  }

  // ========== TRIGGER METHODS ==========

  /**
   * Notify user when they receive a message
   * @param {number} receiverId - Receiver user ID
   * @param {string} senderName - Sender's name
   */
  static async notifyMessageReceived(receiverId, senderName) {
    return await this.createNotification(
      receiverId,
      'New Message',
      `You have received a new message from ${senderName}`,
      'message'
    );
  }

  /**
   * Notify NGO when donation is accepted
   * @param {number} ngoUserId - NGO user ID
   * @param {string} donorName - Donor's name
   * @param {number} amount - Donation amount
   */
  static async notifyDonationAccepted(ngoUserId, donorName, amount) {
    return await this.createNotification(
      ngoUserId,
      'Donation Received',
      `${donorName} has made a donation of $${amount}`,
      'donation'
    );
  }

  /**
   * Notify user when they receive a swap request
   * @param {number} ownerId - Product owner user ID
   * @param {string} ownerProductTitle - Owner's product title
   * @param {string} requesterProductTitle - Requester's product title
   */
  static async notifySwapRequest(ownerId, ownerProductTitle, requesterProductTitle) {
    return await this.createNotification(
      ownerId,
      'New Swap Request',
      `Someone wants to swap "${requesterProductTitle}" for your "${ownerProductTitle}"`,
      'swap'
    );
  }

  /**
   * Notify user when their swap request is accepted
   * @param {number} userId - User ID who initiated swap
   * @param {string} itemTitle - Swap item title
   */
  static async notifySwapAccepted(userId, itemTitle) {
    return await this.createNotification(
      userId,
      'Swap Accepted',
      `Your swap request for "${itemTitle}" has been accepted`,
      'swap'
    );
  }

  /**
   * Notify seller when order is placed
   * @param {number} sellerId - Seller user ID
   * @param {string} productTitle - Product title
   * @param {string} buyerName - Buyer's name
   */
  static async notifyOrderPlaced(sellerId, productTitle, buyerName) {
    return await this.createNotification(
      sellerId,
      'New Order',
      `${buyerName} has placed an order for "${productTitle}"`,
      'order'
    );
  }

  /**
   * Notify buyer when order status changes
   * @param {number} buyerId - Buyer user ID
   * @param {string} productTitle - Product title
   * @param {string} status - New order status
   */
  static async notifyOrderStatusChanged(buyerId, productTitle, status) {
    return await this.createNotification(
      buyerId,
      'Order Update',
      `Your order for "${productTitle}" is now ${status}`,
      'order'
    );
  }
}

module.exports = NotificationService;
