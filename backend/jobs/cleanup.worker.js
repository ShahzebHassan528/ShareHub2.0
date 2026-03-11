/**
 * Cleanup Worker
 * Processes cleanup jobs for old logs and temporary data
 */

const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');
const { AdminLog, Notification } = require('../database/models');
const { Op } = require('sequelize');

// Cleanup worker processor
const cleanupWorker = new Worker(
  'cleanup',
  async (job) => {
    const { type, data } = job.data;
    
    console.log(`🔷 Processing cleanup job: ${job.id} (${type})`);
    
    try {
      let result;
      
      switch (type) {
        case 'oldLogs':
          // Delete admin logs older than specified days
          const logDays = data.days || 90;
          const logDate = new Date();
          logDate.setDate(logDate.getDate() - logDays);
          
          const deletedLogs = await AdminLog.destroy({
            where: {
              created_at: {
                [Op.lt]: logDate
              }
            }
          });
          
          result = { deletedLogs, type: 'oldLogs', days: logDays };
          console.log(`✅ Deleted ${deletedLogs} admin logs older than ${logDays} days`);
          break;
          
        case 'oldNotifications':
          // Delete read notifications older than specified days
          const notifDays = data.days || 30;
          const notifDate = new Date();
          notifDate.setDate(notifDate.getDate() - notifDays);
          
          const deletedNotifications = await Notification.destroy({
            where: {
              is_read: true,
              created_at: {
                [Op.lt]: notifDate
              }
            }
          });
          
          result = { deletedNotifications, type: 'oldNotifications', days: notifDays };
          console.log(`✅ Deleted ${deletedNotifications} read notifications older than ${notifDays} days`);
          break;
          
        case 'tempData':
          // Clean up temporary data (placeholder for future use)
          console.log('✅ Temporary data cleanup completed');
          result = { type: 'tempData', message: 'No temp data to clean' };
          break;
          
        default:
          throw new Error(`Unknown cleanup type: ${type}`);
      }
      
      console.log(`✅ Cleanup job completed: ${job.id}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Cleanup job failed: ${job.id}`, error.message);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1 // Process cleanup jobs one at a time
  }
);

// Worker event listeners
cleanupWorker.on('completed', (job) => {
  console.log(`✅ Cleanup job completed: ${job.id}`);
});

cleanupWorker.on('failed', (job, err) => {
  console.error(`❌ Cleanup job failed: ${job.id}`, err.message);
});

cleanupWorker.on('error', (err) => {
  console.error('❌ Cleanup worker error:', err.message);
});

console.log('✅ Cleanup worker started');

module.exports = cleanupWorker;
