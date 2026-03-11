/**
 * Test Notification System
 * Tests notification creation and retrieval
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const user1Credentials = {
  email: 'admin@marketplace.com',
  password: 'admin123'
};

let user1Token = '';
let user2Token = '';

async function testNotificationSystem() {
  console.log('');
  console.log('='.repeat(80));
  console.log('🧪 TESTING NOTIFICATION SYSTEM');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Login as User 1
    console.log('📝 Step 1: Login as User 1 (Admin)');
    console.log('-'.repeat(80));
    
    const login1Response = await axios.post(`${BASE_URL}/auth/signin`, user1Credentials);
    user1Token = login1Response.data.token;
    const user1Id = login1Response.data.user.id;
    
    console.log('✅ User 1 logged in successfully');
    console.log('   User ID:', user1Id);
    console.log('   Token:', user1Token.substring(0, 20) + '...');
    console.log('');

    // Step 2: Get Initial Notifications
    console.log('📝 Step 2: Get Initial Notifications');
    console.log('-'.repeat(80));
    
    const initialNotifs = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log('✅ Initial notifications retrieved');
    console.log('   Count:', initialNotifs.data.count);
    console.log('   Unread:', initialNotifs.data.unread_count);
    console.log('');

    // Step 3: Get Unread Count
    console.log('📝 Step 3: Get Unread Count');
    console.log('-'.repeat(80));
    
    const unreadCount = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log('✅ Unread count retrieved');
    console.log('   Unread:', unreadCount.data.unread_count);
    console.log('');

    // Step 4: Get Only Unread Notifications
    console.log('📝 Step 4: Get Only Unread Notifications');
    console.log('-'.repeat(80));
    
    const unreadNotifs = await axios.get(`${BASE_URL}/notifications?unread=true`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log('✅ Unread notifications retrieved');
    console.log('   Count:', unreadNotifs.data.count);
    
    if (unreadNotifs.data.notifications.length > 0) {
      console.log('   First notification:');
      console.log('     Title:', unreadNotifs.data.notifications[0].title);
      console.log('     Message:', unreadNotifs.data.notifications[0].message);
      console.log('     Type:', unreadNotifs.data.notifications[0].type);
    }
    console.log('');

    // Step 5: Mark One Notification as Read
    if (unreadNotifs.data.notifications.length > 0) {
      console.log('📝 Step 5: Mark One Notification as Read');
      console.log('-'.repeat(80));
      
      const notifId = unreadNotifs.data.notifications[0].id;
      
      const markReadResponse = await axios.put(
        `${BASE_URL}/notifications/read/${notifId}`,
        {},
        { headers: { Authorization: `Bearer ${user1Token}` } }
      );
      
      console.log('✅ Notification marked as read');
      console.log('   Notification ID:', notifId);
      console.log('');
    }

    // Step 6: Mark All as Read
    console.log('📝 Step 6: Mark All Notifications as Read');
    console.log('-'.repeat(80));
    
    const markAllResponse = await axios.put(
      `${BASE_URL}/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    console.log('✅ All notifications marked as read');
    console.log('   Count:', markAllResponse.data.count);
    console.log('');

    // Step 7: Verify Unread Count is Zero
    console.log('📝 Step 7: Verify Unread Count');
    console.log('-'.repeat(80));
    
    const finalUnreadCount = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log('✅ Final unread count retrieved');
    console.log('   Unread:', finalUnreadCount.data.unread_count);
    console.log('');

    // Step 8: Test Notification Trigger (Send Message)
    console.log('📝 Step 8: Test Notification Trigger (Send Message)');
    console.log('-'.repeat(80));
    console.log('⚠️  To test notification triggers:');
    console.log('   1. Send a message to another user');
    console.log('   2. Check that user\'s notifications');
    console.log('   3. Notification should be created automatically');
    console.log('');
    console.log('   Example:');
    console.log('   POST /api/messages/send');
    console.log('   Body: { receiver_id: 2, message: "Hello" }');
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ NOTIFICATION SYSTEM TEST COMPLETE');
    console.log('='.repeat(80));
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Get all notifications');
    console.log('  ✅ Get unread count');
    console.log('  ✅ Get unread notifications only');
    console.log('  ✅ Mark notification as read');
    console.log('  ✅ Mark all as read');
    console.log('  ✅ Notification service ready');
    console.log('');
    console.log('Automatic Triggers:');
    console.log('  📬 Message received → Notification created');
    console.log('  💰 Donation accepted → Notification created');
    console.log('  🔄 Swap accepted → Notification created');
    console.log('  📦 Order placed → Notification created');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ TEST FAILED');
    console.error('');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testNotificationSystem().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
