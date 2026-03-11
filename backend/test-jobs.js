/**
 * BullMQ Job Testing Script
 * Tests job enqueueing and processing
 */

const JobService = require('./services/job.service');
const { emailQueue, notificationQueue, cleanupQueue } = require('./config/queue');

console.log('🧪 Starting BullMQ Job Tests...\n');

async function testWelcomeEmail() {
  console.log('📝 Test 1: Welcome Email Job');
  try {
    const result = await JobService.enqueueWelcomeEmail({
      email: 'test@example.com',
      full_name: 'Test User'
    });
    
    if (result) {
      console.log(`   ✅ Job enqueued: ${result.jobId}`);
      console.log(`   ✅ Queue: ${result.queue}`);
    } else {
      console.log('   ❌ Failed to enqueue job');
    }
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testOrderEmail() {
  console.log('\n📝 Test 2: Order Confirmation Email Job');
  try {
    const result = await JobService.enqueueOrderEmail({
      buyerEmail: 'buyer@example.com',
      buyerName: 'Test Buyer',
      orderId: 123,
      totalAmount: 99.99
    });
    
    if (result) {
      console.log(`   ✅ Job enqueued: ${result.jobId}`);
      console.log(`   ✅ Queue: ${result.queue}`);
    } else {
      console.log('   ❌ Failed to enqueue job');
    }
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testDonationEmail() {
  console.log('\n📝 Test 3: Donation Email Job');
  try {
    const result = await JobService.enqueueDonationEmail({
      ngoEmail: 'ngo@example.com',
      ngoName: 'Test NGO',
      donorName: 'Test Donor',
      amount: 50
    });
    
    if (result) {
      console.log(`   ✅ Job enqueued: ${result.jobId}`);
      console.log(`   ✅ Queue: ${result.queue}`);
    } else {
      console.log('   ❌ Failed to enqueue job');
    }
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testOrderNotification() {
  console.log('\n📝 Test 4: Order Notification Job');
  try {
    const result = await JobService.enqueueOrderNotification({
      sellerId: 1,
      productTitle: 'Test Product',
      orderId: 123
    });
    
    if (result) {
      console.log(`   ✅ Job enqueued: ${result.jobId}`);
      console.log(`   ✅ Queue: ${result.queue}`);
    } else {
      console.log('   ❌ Failed to enqueue job');
    }
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testSwapNotification() {
  console.log('\n📝 Test 5: Swap Notification Job');
  try {
    const result = await JobService.enqueueSwapNotification('swapAccepted', {
      requesterId: 1,
      swapId: 456
    });
    
    if (result) {
      console.log(`   ✅ Job enqueued: ${result.jobId}`);
      console.log(`   ✅ Queue: ${result.queue}`);
    } else {
      console.log('   ❌ Failed to enqueue job');
    }
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testQueueStats() {
  console.log('\n📝 Test 6: Queue Statistics');
  try {
    const stats = await JobService.getQueueStats();
    
    if (stats) {
      console.log('   ✅ Email Queue:');
      console.log(`      - Waiting: ${stats.email.waiting}`);
      console.log(`      - Active: ${stats.email.active}`);
      console.log(`      - Completed: ${stats.email.completed}`);
      console.log(`      - Failed: ${stats.email.failed}`);
      
      console.log('   ✅ Notification Queue:');
      console.log(`      - Waiting: ${stats.notification.waiting}`);
      console.log(`      - Active: ${stats.notification.active}`);
      console.log(`      - Completed: ${stats.notification.completed}`);
      console.log(`      - Failed: ${stats.notification.failed}`);
      
      console.log('   ✅ Cleanup Queue:');
      console.log(`      - Waiting: ${stats.cleanup.waiting}`);
      console.log(`      - Active: ${stats.cleanup.active}`);
      console.log(`      - Completed: ${stats.cleanup.completed}`);
      console.log(`      - Failed: ${stats.cleanup.failed}`);
    } else {
      console.log('   ❌ Failed to get stats');
    }
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testJobRetry() {
  console.log('\n📝 Test 7: Job Retry Mechanism');
  try {
    // Enqueue a job that will fail (invalid email)
    const job = await emailQueue.add(
      'test-retry',
      {
        type: 'invalid', // This will cause the worker to fail
        data: { email: 'test@example.com' }
      }
    );
    
    console.log(`   ✅ Job enqueued: ${job.id}`);
    console.log('   ℹ️  Job will fail and retry 3 times with exponential backoff');
    console.log('   ℹ️  Check worker logs to see retry attempts');
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function runAllTests() {
  try {
    console.log('='.repeat(60));
    console.log('BULLMQ JOB TESTING SUITE');
    console.log('='.repeat(60) + '\n');

    await testWelcomeEmail();
    await testOrderEmail();
    await testDonationEmail();
    await testOrderNotification();
    await testSwapNotification();
    await testQueueStats();
    await testJobRetry();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    
    console.log('\n📊 To see jobs being processed:');
    console.log('   1. Start workers: node backend/jobs/start-workers.js');
    console.log('   2. Watch the logs for job processing');
    console.log('   3. Jobs will be processed automatically\n');

    // Wait a bit for jobs to be enqueued
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Close queues
    await emailQueue.close();
    await notificationQueue.close();
    await cleanupQueue.close();
    
    console.log('✅ Queues closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
