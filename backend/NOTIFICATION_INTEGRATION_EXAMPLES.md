# Notification Integration Examples

This document shows how to integrate notifications into your routes.

## Service Import

Add this to the top of your route file:

```javascript
const NotificationService = require('../services/notificationService');
```

---

## 1. Message Received (Already Implemented)

**Location**: `routes/messages.js` - POST `/send`

```javascript
// After sending message
const sender = await User.findById(sender_id);
await NotificationService.notifyMessageReceived(receiver_id, sender.full_name);
```

---

## 2. Donation Accepted

**Location**: `routes/donations.js` - POST `/create` or PUT `/accept/:id`

```javascript
// After donation is accepted/created
const donor = await User.findById(donor_id);
const ngo = await NGO.findById(ngo_id);

// Get NGO's user_id
await NotificationService.notifyDonationAccepted(
  ngo.user_id,
  donor.full_name,
  donation.amount
);
```

---

## 3. Swap Accepted (Already Implemented)

**Location**: `routes/swaps.js` - PUT `/accept/:id`

```javascript
// After swap is accepted
const swapDetails = await Swap.findById(swapId);
await NotificationService.notifySwapAccepted(
  swap.requester_id,
  swapDetails.item_title || 'your item'
);
```

---

## 4. Order Placed

**Location**: `routes/orders.js` - POST `/create`

```javascript
// After order is created
const buyer = await User.findById(buyer_id);
const product = await Product.findById(product_id);
const seller = await Seller.findById(product.seller_id);

// Notify seller
await NotificationService.notifyOrderPlaced(
  seller.user_id,
  product.title,
  buyer.full_name
);
```

---

## 5. Order Status Changed

**Location**: `routes/orders.js` - PUT `/status/:id`

```javascript
// After order status is updated
const order = await Order.findById(order_id);
const product = await Product.findById(order.product_id);

await NotificationService.notifyOrderStatusChanged(
  order.buyer_id,
  product.title,
  order.status // e.g., 'shipped', 'delivered'
);
```

---

## Error Handling Pattern

Always wrap notification calls in try-catch to prevent notification failures from breaking the main flow:

```javascript
try {
  await NotificationService.notifyMessageReceived(receiver_id, sender.full_name);
} catch (notifError) {
  console.error('⚠️  Failed to create notification:', notifError.message);
  // Don't fail the request if notification fails
}
```

---

## Available Notification Methods

### NotificationService Methods

```javascript
// Core method
NotificationService.createNotification(userId, title, message, type)

// Trigger methods
NotificationService.notifyMessageReceived(receiverId, senderName)
NotificationService.notifyDonationAccepted(ngoUserId, donorName, amount)
NotificationService.notifySwapAccepted(userId, itemTitle)
NotificationService.notifyOrderPlaced(sellerId, productTitle, buyerName)
NotificationService.notifyOrderStatusChanged(buyerId, productTitle, status)

// Query methods
NotificationService.getUserNotifications(userId, unreadOnly)
NotificationService.markAsRead(notificationId, userId)
NotificationService.markAllAsRead(userId)
NotificationService.getUnreadCount(userId)
```

---

## Notification Types

Use these type values for consistency:

- `'message'` - Message notifications
- `'donation'` - Donation notifications
- `'swap'` - Swap notifications
- `'order'` - Order notifications
- `'system'` - System notifications
- `null` - Generic notifications

---

## Testing

After integrating notifications, test with:

```bash
cd backend
node test-notifications.js
```

---

## API Endpoints

Users can access their notifications via:

```
GET /api/notifications              - Get all notifications
GET /api/notifications?unread=true  - Get unread only
GET /api/notifications/unread-count - Get unread count
PUT /api/notifications/read/:id     - Mark one as read
PUT /api/notifications/read-all     - Mark all as read
```

All endpoints require authentication (JWT token).
