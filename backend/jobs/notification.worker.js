/**
 * Notification Worker
 * Processes in-app notification jobs
 */

const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');
const { Notification } = require('../database/models');

// Notification worker processor
const notificationWorker = new Worker(
  'notification',
  async (job) => {
    const { type, data } = job.data;
    
    console.log(`🔷 Processing notification job: ${job.id} (${type})`);
    
    try {
      let notificationData;
      
      switch (type) {
        case 'orderPlaced':
          notificationData = {
            user_id: data.sellerId,
            type: 'order',
            title: 'New Order Received',
            message: `You have a new order for ${data.productTitle}`,
            related_id: data.orderId,
            is_read: false
          };
          break;
          
        case 'orderStatusChanged':
          notificationData = {
            user_id: data.buyerId,
            type: 'order',
            title: 'Order Status Updated',
            message: `Your order status changed to: ${data.status}`,
            related_id: data.orderId,
            is_read: false
          };
          break;
          
        case 'donationAccepted':
          notificationData = {
            user_id: data.donorId,
            type: 'donation',
            title: 'Donation Accepted',
            message: `Your donation has been accepted by ${data.ngoName}`,
            related_id: data.donationId,
            is_read: false
          };
          break;
          
        case 'swapAccepted':
          notificationData = {
            user_id: data.requesterId,
            type: 'swap',
            title: 'Swap Request Accepted',
            message: `Your swap request has been accepted!`,
            related_id: data.swapId,
            is_read: false
          };
          break;
          
        case 'swapRejected':
          notificationData = {
            user_id: data.requesterId,
            type: 'swap',
            title: 'Swap Request Rejected',
            message: `Your swap request was rejected`,
            related_id: data.swapId,
            is_read: false
          };
          break;
          
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
      
      // Create notification in database
      const notification = await Notification.create(notificationData);
      
      console.log(`✅ Notification created: ${notification.id}`);
      return { notificationId: notification.id };
      
    } catch (error) {
      console.error(`❌ Notification job failed: ${job.id}`, error.message);
      throw error; // Will trigger retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 10 // Process 10 notifications concurrently
  }
);

// Worker event listeners
notificationWorker.on('completed', (job) => {
  console.log(`✅ Notification job completed: ${job.id}`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Notification job failed: ${job.id}`, err.message);
  console.error(`   Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
});

notificationWorker.on('error', (err) => {
  console.error('❌ Notification worker error:', err.message);
});

console.log('✅ Notification worker started');

module.exports = notificationWorker;
