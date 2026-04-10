# ShareHub 2.0 - Messaging System Guide

## How to Send Messages

### Method 1: From Product Page (Recommended)

1. **Browse Products:**
   - Go to: http://localhost:3000/products
   - Click on any product

2. **Contact Seller:**
   - On product detail page, you'll see seller information
   - Click "Contact Seller" or "Message Seller" button
   - This will open messaging page with that seller

3. **Send Message:**
   - Type your message
   - Click "Send"
   - Message delivered!

---

### Method 2: From Messages Page

1. **Go to Messages:**
   - Click "Messages" icon in navbar (chat icon)
   - Or go to: http://localhost:3000/messages

2. **View Conversations:**
   - You'll see list of all your conversations
   - Click on any conversation to open chat

3. **Send Message:**
   - Type in message box at bottom
   - Press Enter or click Send button

---

### Method 3: Start New Conversation

1. **Go to Messages Page:**
   - http://localhost:3000/messages

2. **Start New Chat:**
   - Look for "New Message" or "+" button
   - Select user from list
   - Type and send message

---

## Messaging Features

### 1. Real-time Chat
- Messages appear instantly
- No need to refresh page
- Conversation history saved

### 2. Unread Count
- Badge on Messages icon shows unread count
- Red notification badge
- Updates automatically

### 3. Message Notifications
- Get notified when someone messages you
- Notification appears in notification center
- Click to open conversation

### 4. Conversation List
- See all your chats in one place
- Shows last message preview
- Shows timestamp
- Shows unread indicator

---

## Message Flow Example

### Scenario: Buyer wants to ask about a product

1. **Buyer (John Doe):**
   - Logs in: `buyer1@example.com` / `password123`
   - Goes to Products page
   - Clicks on "iPhone 14 Pro" (seller: Tech Store Owner)
   - Clicks "Contact Seller" button
   - Types: "Is this product still available?"
   - Clicks Send

2. **Seller (Tech Store Owner):**
   - Sees notification badge on Messages icon
   - Clicks Messages
   - Sees new message from John Doe
   - Clicks on conversation
   - Reads: "Is this product still available?"
   - Replies: "Yes, it's available. Would you like to buy it?"

3. **Buyer (John Doe):**
   - Gets notification
   - Opens conversation
   - Reads reply
   - Continues conversation

---

## Messaging Page Layout

### Left Side: Conversation List
```
┌─────────────────────────┐
│ Messages                │
├─────────────────────────┤
│ 🔍 Search conversations │
├─────────────────────────┤
│ 👤 Tech Store Owner     │
│    Is this available?   │
│    2 min ago         🔴 │
├─────────────────────────┤
│ 👤 Jane Smith           │
│    Thanks for the info  │
│    1 hour ago           │
├─────────────────────────┤
│ 👤 Fashion Hub          │
│    I'm interested       │
│    Yesterday            │
└─────────────────────────┘
```

### Right Side: Chat Window
```
┌─────────────────────────────────┐
│ 👤 Tech Store Owner        ✕    │
├─────────────────────────────────┤
│                                 │
│  Is this product available?     │
│  [You] 2:30 PM                  │
│                                 │
│         Yes, it's available!    │
│         [Seller] 2:31 PM        │
│                                 │
│  Great! Can we meet tomorrow?   │
│  [You] 2:32 PM                  │
│                                 │
├─────────────────────────────────┤
│ Type a message...          Send │
└─────────────────────────────────┘
```

---

## API Endpoints for Messaging

### 1. Get All Conversations
```
GET /api/v1/messages
Headers: Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "conversations": [
    {
      "user_id": 4,
      "user_name": "Tech Store Owner",
      "last_message": "Is this available?",
      "last_message_time": "2026-04-08T10:30:00Z",
      "unread_count": 1
    }
  ]
}
```

### 2. Get Conversation with Specific User
```
GET /api/v1/messages/4
Headers: Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "sender_id": 2,
      "receiver_id": 4,
      "message": "Is this product available?",
      "is_read": true,
      "created_at": "2026-04-08T10:30:00Z"
    },
    {
      "id": 2,
      "sender_id": 4,
      "receiver_id": 2,
      "message": "Yes, it's available!",
      "is_read": false,
      "created_at": "2026-04-08T10:31:00Z"
    }
  ]
}
```

### 3. Send Message
```
POST /api/v1/messages
Headers: 
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "receiver_id": 4,
  "message": "Is this product still available?"
}

Response:
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": 3,
    "sender_id": 2,
    "receiver_id": 4,
    "message": "Is this product still available?",
    "created_at": "2026-04-08T10:35:00Z"
  }
}
```

### 4. Mark Message as Read
```
PUT /api/v1/messages/3/read
Headers: Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "message": "Message marked as read"
}
```

### 5. Get Unread Count
```
GET /api/v1/messages/unread-count
Headers: Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "unread_count": 3
}
```

---

## Testing Messaging System

### Test Scenario 1: Buyer Messages Seller

1. **Login as Buyer:**
   - Email: `buyer1@example.com`
   - Password: `password123`

2. **Go to Product:**
   - http://localhost:3000/products/13

3. **Click "Contact Seller"**

4. **Send Message:**
   - Type: "Hello, is this available?"
   - Click Send

5. **Verify:**
   - Message should appear in chat
   - Check backend logs for message creation

---

### Test Scenario 2: Seller Replies

1. **Logout and Login as Seller:**
   - Email: `seller1@example.com`
   - Password: `seller123`

2. **Check Messages:**
   - Click Messages icon (should show unread badge)
   - Open conversation with buyer

3. **Reply:**
   - Type: "Yes, it's available!"
   - Click Send

4. **Verify:**
   - Reply should appear
   - Buyer should get notification

---

### Test Scenario 3: Direct Messaging

1. **Login as any user**

2. **Go to Messages:**
   - http://localhost:3000/messages

3. **Start New Conversation:**
   - Click "New Message" or "+"
   - Select user
   - Send message

---

## Postman Testing

### 1. Login First
```
POST http://localhost:5000/api/v1/auth/login
Body:
{
  "email": "buyer1@example.com",
  "password": "password123"
}
```
Copy the token!

### 2. Get Conversations
```st
GET http://localhost:5000/api/v1/messages
Headers:
  Authorization: Bearer YOUR_TOKEN
```

### 3. Send Message
```
POST http://localhost:5000/api/v1/messages
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "receiver_id": 4,
  "message": "Test message from Postman"
}
```

### 4. Get Conversation
```
GET http://localhost:5000/api/v1/messages/4
Headers:
  Authorization: Bearer YOUR_TOKEN
```

---

## Database Tables

### Messages Table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

---

## Frontend Components

### Key Files:
- `frontend/src/pages/MessagesPage.jsx` - Main messages page
- `frontend/src/pages/ConversationPage.jsx` - Individual conversation
- `frontend/src/api/message.api.js` - Message API calls
- `frontend/src/hooks/useMessageCount.js` - Unread count hook

---

## Common Issues & Solutions

### Issue 1: "Contact Seller" button not showing
**Solution:** 
- Make sure you're logged in
- Make sure you're not the seller of that product
- Check if product has seller information

### Issue 2: Messages not sending
**Solution:**
- Check if logged in (token present)
- Check browser console for errors
- Check backend logs
- Verify receiver_id is valid

### Issue 3: Unread count not updating
**Solution:**
- Refresh page
- Check if useMessageCount hook is working
- Check API endpoint: `/api/v1/messages/unread-count`

### Issue 4: Can't see conversations
**Solution:**
- Make sure you have sent/received messages
- Check if API returns data
- Check browser console for errors

---

## Quick Demo Script

### For Sir's Demo:

1. **Show Messaging Icon:**
   - Point to chat icon in navbar
   - Show unread badge (if any)

2. **Open Messages Page:**
   - Click Messages icon
   - Show conversation list

3. **Open Conversation:**
   - Click on any conversation
   - Show chat history

4. **Send Message:**
   - Type a message
   - Click Send
   - Show message appears instantly

5. **Show from Product Page:**
   - Go to any product
   - Click "Contact Seller"
   - Show it opens messaging

6. **Show API in Postman:**
   - GET /messages - Show conversations
   - POST /messages - Send message
   - GET /messages/4 - Show conversation

---

## Key Points to Highlight

1. **Buyer-Seller Communication:**
   - Direct messaging between buyers and sellers
   - Discuss product details
   - Negotiate prices

2. **Real-time Updates:**
   - Messages appear instantly
   - Unread count updates automatically
   - Notifications for new messages

3. **User-Friendly Interface:**
   - WhatsApp-like chat interface
   - Conversation list on left
   - Chat window on right
   - Easy to use

4. **Integration with Products:**
   - "Contact Seller" button on product pages
   - Seamless flow from browsing to messaging

---

## Summary

**To send a message:**
1. Login to your account
2. Go to any product page
3. Click "Contact Seller" button
4. Type your message and send!

**Or:**
1. Click Messages icon in navbar
2. Select conversation or start new
3. Type and send!

Simple and easy! 💬
