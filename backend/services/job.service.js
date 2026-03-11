/**
 * Job Service
 * Centralized service for enqueueing background jobs
 */

const { emailQueue, notificationQueue, cleanupQueue } = require('../config/queue');

class JobService {
  /**
   * Enqueue welcome email job
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Job info
   */
  static async enqueueWelcomeEmail(userData) {
    try {
      const job = await emailQueue.add(
        'welcome-email',
        {
          type: 'welcome',
          data: {
            email: userData.email,
            userName: userData.full_name
          }
        },
        {
          priority: 1 // High priority
        }
      );
      
      console.log(`📧 Welcome email enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'email' };
    } catch (error) {
      console.error('❌ Failed to enqueue welcome email:', error.message);
      // Don't throw - email failure shouldn't block signup
      return null;
    }
  }

  /**
   * Enqueue order confirmation email job
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Job info
   */
  static async enqueueOrderEmail(orderData) {
    try {
      const job = await emailQueue.add(
        'order-email',
        {
          type: 'orderConfirmation',
          data: {
            email: orderData.buyerEmail,
            userName: orderData.buyerName,
            orderId: orderData.orderId,
            totalAmount: orderData.totalAmount
          }
        },
        {
          priority: 2 // Medium priority
        }
      );
      
      console.log(`📧 Order email enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'email' };
    } catch (error) {
      console.error('❌ Failed to enqueue order email:', error.message);
      return null;
    }
  }

  /**
   * Enqueue donation notification email job
   * @param {Object} donationData - Donation data
   * @returns {Promise<Object>} Job info
   */
  static async enqueueDonationEmail(donationData) {
    try {
      const job = await emailQueue.add(
        'donation-email',
        {
          type: 'donationReceived',
          data: {
            ngoEmail: donationData.ngoEmail,
            ngoName: donationData.ngoName,
            donorName: donationData.donorName,
            amount: donationData.amount
          }
        },
        {
          priority: 2 // Medium priority
        }
      );
      
      console.log(`📧 Donation email enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'email' };
    } catch (error) {
      console.error('❌ Failed to enqueue donation email:', error.message);
      return null;
    }
  }

  /**
   * Enqueue order placed notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Job info
   */
  static async enqueueOrderNotification(notificationData) {
    try {
      const job = await notificationQueue.add(
        'order-notification',
        {
          type: 'orderPlaced',
          data: notificationData
        }
      );
      
      console.log(`🔔 Order notification enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'notification' };
    } catch (error) {
      console.error('❌ Failed to enqueue order notification:', error.message);
      return null;
    }
  }

  /**
   * Enqueue order status change notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Job info
   */
  static async enqueueOrderStatusNotification(notificationData) {
    try {
      const job = await notificationQueue.add(
        'order-status-notification',
        {
          type: 'orderStatusChanged',
          data: notificationData
        }
      );
      
      console.log(`🔔 Order status notification enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'notification' };
    } catch (error) {
      console.error('❌ Failed to enqueue order status notification:', error.message);
      return null;
    }
  }

  /**
   * Enqueue donation accepted notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Job info
   */
  static async enqueueDonationNotification(notificationData) {
    try {
      const job = await notificationQueue.add(
        'donation-notification',
        {
          type: 'donationAccepted',
          data: notificationData
        }
      );
      
      console.log(`🔔 Donation notification enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'notification' };
    } catch (error) {
      console.error('❌ Failed to enqueue donation notification:', error.message);
      return null;
    }
  }

  /**
   * Enqueue swap notification
   * @param {string} type - 'swapAccepted' or 'swapRejected'
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Job info
   */
  static async enqueueSwapNotification(type, notificationData) {
    try {
      const job = await notificationQueue.add(
        'swap-notification',
        {
          type,
          data: notificationData
        }
      );
      
      console.log(`🔔 Swap notification enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'notification' };
    } catch (error) {
      console.error('❌ Failed to enqueue swap notification:', error.message);
      return null;
    }
  }

  /**
   * Enqueue cleanup job for old logs
   * @param {number} days - Days to keep
   * @returns {Promise<Object>} Job info
   */
  static async enqueueLogCleanup(days = 90) {
    try {
      const job = await cleanupQueue.add(
        'log-cleanup',
        {
          type: 'oldLogs',
          data: { days }
        },
        {
          repeat: {
            pattern: '0 2 * * *' // Run daily at 2 AM
          }
        }
      );
      
      console.log(`🧹 Log cleanup job enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'cleanup' };
    } catch (error) {
      console.error('❌ Failed to enqueue log cleanup:', error.message);
      return null;
    }
  }

  /**
   * Enqueue cleanup job for old notifications
   * @param {number} days - Days to keep
   * @returns {Promise<Object>} Job info
   */
  static async enqueueNotificationCleanup(days = 30) {
    try {
      const job = await cleanupQueue.add(
        'notification-cleanup',
        {
          type: 'oldNotifications',
          data: { days }
        },
        {
          repeat: {
            pattern: '0 3 * * *' // Run daily at 3 AM
          }
        }
      );
      
      console.log(`🧹 Notification cleanup job enqueued: ${job.id}`);
      return { jobId: job.id, queue: 'cleanup' };
    } catch (error) {
      console.error('❌ Failed to enqueue notification cleanup:', error.message);
      return null;
    }
  }

  /**
   * Get queue statistics
   * @returns {Promise<Object>} Queue stats
   */
  static async getQueueStats() {
    try {
      const [emailStats, notificationStats, cleanupStats] = await Promise.all([
        emailQueue.getJobCounts(),
        notificationQueue.getJobCounts(),
        cleanupQueue.getJobCounts()
      ]);

      return {
        email: emailStats,
        notification: notificationStats,
        cleanup: cleanupStats
      };
    } catch (error) {
      console.error('❌ Failed to get queue stats:', error.message);
      return null;
    }
  }
}

module.exports = JobService;
