# Service Layer Quick Reference

## Import Services

```javascript
// Import all services
const { 
  AuthService, 
  UserService, 
  ProductService, 
  OrderService,
  DonationService,
  SwapService,
  NotificationService 
} = require('../services');

// Or import individually
const AuthService = require('../services/auth.service');
```

## AuthService

```javascript
// Register user
const result = await AuthService.register({
  email, password, full_name, phone, role,
  // For seller: business_name, business_address, business_license, tax_id
  // For NGO: ngo_name, registration_number, address, website, description
});
// Returns: { message, token, user }

// Login
const result = await AuthService.login(email, password);
// Returns: { message, token, user }

// Generate token
const token = AuthService.generateToken(userId, role);

// Verify token
const decoded = AuthService.verifyToken(token);

// Refresh token
const newToken = AuthService.refreshToken(oldToken);
```

## UserService

```javascript
// Get profile
const profile = await UserService.getProfile(userId);

// Update profile
const updated = await UserService.updateProfile(userId, {
  full_name, phone, address, profile_image
});

// Get public profile
const public = await UserService.getPublicProfile(userId);

// Get user by ID
const user = await UserService.getUserById(userId);

// Get user by email
const user = await UserService.getUserByEmail(email);

// List users
const users = await UserService.listUsers({ role: 'buyer' });

// Suspend user (admin)
const suspended = await UserService.suspendUser(userId, adminId, reason);

// Reactivate user (admin)
const reactivated = await UserService.reactivateUser(userId, adminId);
```

## ProductService

```javascript
// Get all products
const products = await ProductService.getAllProducts({ 
  category, condition, minPrice, maxPrice 
});

// Get product by ID
const product = await ProductService.getProductById(productId, incrementViews);

// Find nearby products
const nearby = await ProductService.findNearbyProducts(lat, lng, radiusKm);

// Create product
const productId = await ProductService.createProduct({
  title, description, price, seller_id, category_id, condition
});

// Update product
const updated = await ProductService.updateProduct(productId, data);

// Delete product
const deleted = await ProductService.deleteProduct(productId);

// Block product (admin)
const blocked = await ProductService.blockProduct(productId, adminId, reason);

// Unblock product (admin)
const unblocked = await ProductService.unblockProduct(productId, adminId);

// Get products by seller
const products = await ProductService.getProductsBySeller(sellerId);
```

## OrderService

```javascript
// Create order
const order = await OrderService.createOrder(buyerId, items, orderData);
// items: [{ product_id, quantity }]

// Get order by ID
const order = await OrderService.getOrderById(orderId);

// Get orders by buyer
const orders = await OrderService.getOrdersByBuyer(buyerId);

// Get orders by seller
const orders = await OrderService.getOrdersBySeller(sellerId);

// Update order status
const updated = await OrderService.updateOrderStatus(orderId, status, userId);
// status: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'

// Update payment status
const updated = await OrderService.updatePaymentStatus(orderId, status);
// status: 'pending', 'paid', 'failed', 'refunded'

// Cancel order
const cancelled = await OrderService.cancelOrder(orderId, userId);

// Get order statistics
const stats = await OrderService.getOrderStatistics(userId, role);
```

## DonationService

```javascript
// Create donation
const donationId = await DonationService.createDonation({
  donor_id, ngo_id, product_id, amount
});

// Get donation by ID
const donation = await DonationService.getDonationById(donationId);

// Get donations by donor
const donations = await DonationService.getDonationsByDonor(donorId);

// Get donations by NGO
const donations = await DonationService.getDonationsByNGO(ngoId);

// Accept donation (NGO)
const accepted = await DonationService.acceptDonation(donationId, ngoUserId);

// Reject donation (NGO)
const rejected = await DonationService.rejectDonation(donationId);

// Complete donation
const completed = await DonationService.completeDonation(donationId);
```

## SwapService

```javascript
// Create swap request
const swapId = await SwapService.createSwapRequest({
  requester_id, owner_id, requester_product_id, owner_product_id
});

// Get swap by ID
const swap = await SwapService.getSwapById(swapId);

// Get received requests
const requests = await SwapService.getReceivedRequests(userId);

// Get sent requests
const requests = await SwapService.getSentRequests(userId);

// Accept swap (owner)
const accepted = await SwapService.acceptSwap(swapId, ownerId);

// Reject swap (owner)
const rejected = await SwapService.rejectSwap(swapId, ownerId);

// Complete swap
const completed = await SwapService.completeSwap(swapId, userId);

// Cancel swap (requester)
const cancelled = await SwapService.cancelSwap(swapId, requesterId);
```

## NotificationService

```javascript
// Create notification
const notification = await NotificationService.createNotification(
  userId, title, message, type
);

// Get user notifications
const notifications = await NotificationService.getUserNotifications(
  userId, unreadOnly
);

// Mark as read
const success = await NotificationService.markAsRead(notificationId, userId);

// Mark all as read
const count = await NotificationService.markAllAsRead(userId);

// Get unread count
const count = await NotificationService.getUnreadCount(userId);

// Trigger notifications
await NotificationService.notifyMessageReceived(receiverId, senderName);
await NotificationService.notifyDonationAccepted(ngoUserId, donorName, amount);
await NotificationService.notifySwapAccepted(userId, itemTitle);
await NotificationService.notifyOrderPlaced(sellerId, productTitle, buyerName);
await NotificationService.notifyOrderStatusChanged(buyerId, productTitle, status);
```

## Error Handling Pattern

```javascript
router.post('/endpoint', async (req, res) => {
  try {
    const result = await Service.method(data);
    res.json({ message: 'Success', result });
  } catch (error) {
    console.error('Error:', error.message);
    
    // Handle specific errors
    if (error.message === 'Not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Validation failed') {
      return res.status(400).json({ 
        error: error.message,
        details: error.details 
      });
    }
    
    // Generic error
    res.status(500).json({ error: 'Server error' });
  }
});
```

## Common Error Messages

- `'User not found'` → 404
- `'Product not found'` → 404
- `'Order not found'` → 404
- `'Invalid credentials'` → 401
- `'Account suspended'` → 403
- `'Validation failed'` → 400 (with details array)
- `'Email already registered'` → 400
- `'Invalid role'` → 400
- `'Cannot suspend admin users'` → 400
- `'Product is not available'` → 400
- `'Can only donate to approved NGOs'` → 400

## Validation Error Format

```javascript
{
  error: 'Validation failed',
  details: [
    'Title is required',
    'Price must be greater than 0'
  ]
}
```
