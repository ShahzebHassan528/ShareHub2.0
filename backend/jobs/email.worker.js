/**
 * Email Worker
 * Processes email jobs from the email queue
 */

const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');

// Email sending function (mock - replace with actual email service)
async function sendEmail(to, subject, body) {
  // TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
  console.log('📧 Sending email:');
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Body: ${body.substring(0, 100)}...`);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true, messageId: `msg_${Date.now()}` };
}

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Marketplace!',
    body: `
      Hi ${userName},
      
      Welcome to our marketplace! We're excited to have you on board.
      
      You can now:
      - Browse products
      - Create listings
      - Make donations
      - Swap items
      
      Get started: http://localhost:3000
      
      Best regards,
      Marketplace Team
    `
  }),
  
  orderConfirmation: (userName, orderId, totalAmount) => ({
    subject: `Order Confirmation #${orderId}`,
    body: `
      Hi ${userName},
      
      Your order #${orderId} has been confirmed!
      
      Total Amount: $${totalAmount}
      
      We'll notify you when your order ships.
      
      Track your order: http://localhost:3000/orders/${orderId}
      
      Thank you for shopping with us!
      
      Best regards,
      Marketplace Team
    `
  }),
  
  donationReceived: (ngoName, donorName, amount) => ({
    subject: 'New Donation Received',
    body: `
      Hi ${ngoName},
      
      You've received a new donation from ${donorName}!
      
      Amount: $${amount}
      
      View details: http://localhost:3000/dashboard
      
      Thank you for your important work!
      
      Best regards,
      Marketplace Team
    `
  })
};

// Email worker processor
const emailWorker = new Worker(
  'email',
  async (job) => {
    const { type, data } = job.data;
    
    console.log(`🔷 Processing email job: ${job.id} (${type})`);
    
    try {
      let template;
      let recipient;
      
      switch (type) {
        case 'welcome':
          template = emailTemplates.welcome(data.userName);
          recipient = data.email;
          break;
          
        case 'orderConfirmation':
          template = emailTemplates.orderConfirmation(
            data.userName,
            data.orderId,
            data.totalAmount
          );
          recipient = data.email;
          break;
          
        case 'donationReceived':
          template = emailTemplates.donationReceived(
            data.ngoName,
            data.donorName,
            data.amount
          );
          recipient = data.ngoEmail;
          break;
          
        default:
          throw new Error(`Unknown email type: ${type}`);
      }
      
      // Send email
      const result = await sendEmail(recipient, template.subject, template.body);
      
      console.log(`✅ Email sent successfully: ${job.id}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Email job failed: ${job.id}`, error.message);
      throw error; // Will trigger retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 5 // Process 5 emails concurrently
  }
);

// Worker event listeners
emailWorker.on('completed', (job) => {
  console.log(`✅ Email job completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job failed: ${job.id}`, err.message);
  console.error(`   Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
});

emailWorker.on('error', (err) => {
  console.error('❌ Email worker error:', err.message);
});

console.log('✅ Email worker started');

module.exports = emailWorker;
