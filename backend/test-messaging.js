/**
 * Test Messaging System
 * 
 * Tests all messaging functionality
 */

const Message = require('./models/Message.sequelize.wrapper');

async function testMessaging() {
  console.log('');
  console.log('='.repeat(80));
  console.log('🧪 TESTING MESSAGING SYSTEM');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Test 1: Send a message
    console.log('📝 Test 1: Send Message');
    console.log('-'.repeat(80));
    
    const message1 = await Message.sendMessage(34, 35, 'Hello! How are you?');
    console.log('✅ Message sent:', message1.id);
    console.log('   From:', message1.sender.full_name);
    console.log('   To:', message1.receiver.full_name);
    console.log('   Content:', message1.message);
    console.log('');

    // Test 2: Send reply
    console.log('📝 Test 2: Send Reply');
    console.log('-'.repeat(80));
    
    const message2 = await Message.sendMessage(35, 34, 'Hi! I\'m doing great, thanks!');
    console.log('✅ Reply sent:', message2.id);
    console.log('');

    // Test 3: Get conversation
    console.log('📝 Test 3: Get Conversation');
    console.log('-'.repeat(80));
    
    const conversation = await Message.getConversation(34, 35);
    console.log(`✅ Retrieved ${conversation.length} messages in conversation`);
    conversation.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.sender.full_name}]: ${msg.message}`);
    });
    console.log('');

    // Test 4: Get user chats
    console.log('📝 Test 4: Get User Chats');
    console.log('-'.repeat(80));
    
    const chats = await Message.getUserChats(34);
    console.log(`✅ User has ${chats.length} chat conversations`);
    chats.forEach((chat, index) => {
      console.log(`   ${index + 1}. ${chat.user.full_name}`);
      console.log(`      Last message: ${chat.last_message}`);
      console.log(`      Unread: ${chat.unread_count}`);
    });
    console.log('');

    // Test 5: Get unread count
    console.log('📝 Test 5: Get Unread Count');
    console.log('-'.repeat(80));
    
    const unreadCount = await Message.getUnreadCount(34);
    console.log(`✅ User has ${unreadCount} unread messages`);
    console.log('');

    // Test 6: Mark as read
    console.log('📝 Test 6: Mark Message as Read');
    console.log('-'.repeat(80));
    
    await Message.markAsRead(message2.id, 34);
    console.log('✅ Message marked as read');
    console.log('');

    // Test 7: Mark conversation as read
    console.log('📝 Test 7: Mark Conversation as Read');
    console.log('-'.repeat(80));
    
    const markedCount = await Message.markConversationAsRead(34, 35);
    console.log(`✅ Marked ${markedCount} messages as read`);
    console.log('');

    // Test 8: Search messages
    console.log('📝 Test 8: Search Messages');
    console.log('-'.repeat(80));
    
    const searchResults = await Message.searchMessages(34, 'great');
    console.log(`✅ Found ${searchResults.length} messages matching "great"`);
    searchResults.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.message}`);
    });
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(80));
    console.log('');
    console.log('🎉 Messaging system is working correctly!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
  }

  process.exit(0);
}

// Run tests
testMessaging();
