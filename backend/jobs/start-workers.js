/**
 * Worker Starter Script
 * Starts all BullMQ workers
 */

console.log('🚀 Starting BullMQ Workers...\n');

// Start all workers
require('./email.worker');
require('./notification.worker');
require('./cleanup.worker');

console.log('\n✅ All workers started successfully');
console.log('📊 Workers are now processing jobs from queues');
console.log('Press Ctrl+C to stop workers\n');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down workers gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down workers gracefully...');
  process.exit(0);
});
