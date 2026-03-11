/**
 * BullMQ Queue Configuration
 * Centralized queue setup using existing Redis connection
 */

const { Queue } = require('bullmq');

// Redis connection config (reuse existing Redis)
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts
    if (times > 3) {
      return null;
    }
    return Math.min(times * 1000, 3000);
  }
};

// Default job options
const defaultJobOptions = {
  attempts: 3, // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 2000 // Start with 2 seconds, then 4s, 8s
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000 // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600 // Keep failed jobs for 7 days
  }
};

let emailQueue = null;
let notificationQueue = null;
let cleanupQueue = null;

try {
  // Email Queue - for signup & order notifications
  emailQueue = new Queue('email', {
    connection: redisConnection,
    defaultJobOptions
  });

  // Notification Queue - for in-app notifications
  notificationQueue = new Queue('notification', {
    connection: redisConnection,
    defaultJobOptions
  });

  // Cleanup Queue - for old logs & temp data
  cleanupQueue = new Queue('cleanup', {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 1, // Don't retry cleanup jobs
      removeOnComplete: true // Remove immediately after completion
    }
  });

  // Suppress error logs - handle silently
  emailQueue.on('error', () => {});
  notificationQueue.on('error', () => {});
  cleanupQueue.on('error', () => {});

  console.log('✅ BullMQ Queues initialized');
} catch (error) {
  console.log('⚠️  BullMQ Queues disabled (Redis not available)');
}

module.exports = {
  emailQueue,
  notificationQueue,
  cleanupQueue,
  redisConnection,
  defaultJobOptions
};
