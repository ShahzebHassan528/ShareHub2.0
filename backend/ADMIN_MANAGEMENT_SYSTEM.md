# 🛡️ Admin Management System

## Overview

The Admin Management System provides comprehensive tools for administrators to manage users and moderate products, with full audit logging.

---

## 🎯 Features Implemented

### 1. User Suspension System

**New Fields in User Model**:
- `is_suspended` (BOOLEAN, default: false)
- `suspended_at` (DATE, nullable)
- `suspended_by` (INTEGER, admin ID)
- `suspension_reason` (TEXT, nullable)

**Capabilities**:
- Suspend users for policy violations
- Reactivate suspended users
- Track suspension history
- Prevent admin suspension

### 2. Product Moderation System

**New Fields in Product Model**:
- `product_status` (ENUM: 'active', 'blocked', default: 'active')
- `blocked_at` (DATE, nullable)
- `blocked_by` (INTEGER, admin ID)
- `block_reason` (TEXT, nullable)

**Capabilities**:
- Block inappropriate products
- Unblock products
- Track moderation history
- Automatic availability update

### 3. Admin Action Logging

**All actions logged in AdminLog table**:
- `suspend_user`
- `reactivate_user`
- `block_product`
- `unblock_product`

---

## 📊 API Endpoints

### User Management

#### GET /api/admin/users
**Purpose**: Get all users with optional filters

**Authorization**: Admin only

**Query Parameters**:
- `role` (optional) - Filter by role (admin, seller, buyer, ngo)
- `is_suspended` (optional) - Filter by suspension status (true/false)

**Response**:
```json
{
  "message": "Users retrieved successfully",
  "count": 10,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "buyer",
      "is_active": true,
      "is_verified": true,
      "is_suspended": false,
      "created_at": "2026-02-27T10:00:00.000Z"
    }
  ]
}
```

#### PUT /api/admin/users/suspend/:id
**Purpose**: Suspend a user

**Authorization**: Admin only

**Request Body**:
```json
{
  "reason": "Violating community guidelines"
}
```

**Response**:
```json
{
  "message": "User suspended successfully",
  "user_id": 1,
  "suspended": true
}
```

**Actions**:
- Sets `is_suspended` to true
- Records `suspended_at` timestamp
- Records `suspended_by` (admin ID)
- Stores `suspension_reason`
- Logs action in AdminLog
- Prevents admin suspension

**Validation**:
- Reason is required
- User must exist
- Cannot suspend admin users
- Cannot suspend already suspended users

#### PUT /api/admin/users/reactivate/:id
**Purpose**: Reactivate a suspended user

**Authorization**: Admin only

**Request Body**: None required

**Response**:
```json
{
  "message": "User reactivated successfully",
  "user_id": 1,
  "suspended": false
}
```

**Actions**:
- Sets `is_suspended` to false
- Clears suspension data
- Logs action in AdminLog

**Validation**:
- User must exist
- User must be suspended

### Product Moderation

#### PUT /api/admin/products/remove/:id
**Purpose**: Block/remove a product

**Authorization**: Admin only

**Request Body**:
```json
{
  "reason": "Inappropriate content"
}
```

**Response**:
```json
{
  "message": "Product blocked successfully",
  "product_id": 1,
  "status": "blocked"
}
```

**Actions**:
- Sets `product_status` to 'blocked'
- Sets `is_available` to false
- Records `blocked_at` timestamp
- Records `blocked_by` (admin ID)
- Stores `block_reason`
- Logs action in AdminLog

**Validation**:
- Reason is required
- Product must exist
- Cannot block already blocked products

#### PUT /api/admin/products/unblock/:id
**Purpose**: Unblock a product

**Authorization**: Admin only

**Request Body**: None required

**Response**:
```json
{
  "message": "Product unblocked successfully",
  "product_id": 1,
  "status": "active"
}
```

**Actions**:
- Sets `product_status` to 'active'
- Sets `is_available` to true
- Clears block data
- Logs action in AdminLog

**Validation**:
- Product must exist
- Product must be blocked

---

## 🔐 Security Features

### Authentication Check Enhancement

**Suspension Check in Auth Middleware**:
```javascript
if (user.is_suspended) {
  return res.status(403).json({ 
    error: 'Account suspended', 
    message: 'Your account has been suspended. Please contact support.',
    suspension_reason: user.suspension_reason
  });
}
```

**Behavior**:
- Suspended users cannot access any authenticated endpoints
- Clear error message with suspension reason
- 403 Forbidden status code

### Authorization

**Admin-Only Access**:
- All endpoints require `authorize(['admin'])` middleware
- Non-admin users receive 403 Forbidden
- Authorization attempts logged

### Validation

**User Suspension**:
- ✅ Reason required
- ✅ User must exist
- ✅ Cannot suspend admins
- ✅ Cannot suspend already suspended users

**Product Moderation**:
- ✅ Reason required
- ✅ Product must exist
- ✅ Cannot block already blocked products

---

## 🔄 Workflows

### User Suspension Flow
```
Admin identifies policy violation
    ↓
Admin calls suspend endpoint with reason
    ↓
System validates request
    ↓
User marked as suspended
    ↓
Action logged in AdminLog
    ↓
User cannot access system (403 on login)
    ↓
Admin can reactivate when appropriate
```

### Product Moderation Flow
```
Admin identifies inappropriate product
    ↓
Admin calls block endpoint with reason
    ↓
System validates request
    ↓
Product marked as blocked
    ↓
Product becomes unavailable
    ↓
Action logged in AdminLog
    ↓
Admin can unblock if needed
```

---

## 📝 Admin Log Entries

### Suspend User
```json
{
  "admin_id": 34,
  "action": "suspend_user",
  "target_type": "user",
  "target_id": 1,
  "details": {
    "user_email": "user@example.com",
    "user_role": "buyer",
    "suspension_reason": "Violating community guidelines"
  }
}
```

### Reactivate User
```json
{
  "admin_id": 34,
  "action": "reactivate_user",
  "target_type": "user",
  "target_id": 1,
  "details": {
    "user_email": "user@example.com",
    "user_role": "buyer"
  }
}
```

### Block Product
```json
{
  "admin_id": 34,
  "action": "block_product",
  "target_type": "product",
  "target_id": 1,
  "details": {
    "product_title": "Laptop",
    "seller_id": 5,
    "block_reason": "Inappropriate content"
  }
}
```

### Unblock Product
```json
{
  "admin_id": 34,
  "action": "unblock_product",
  "target_type": "product",
  "target_id": 1,
  "details": {
    "product_title": "Laptop",
    "seller_id": 5
  }
}
```

---

## 🧪 Testing

### Test Script
```bash
cd backend
node test-admin-management.js
```

### Manual Testing

#### 1. Get All Users
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

#### 2. Get Suspended Users
```bash
curl -X GET "http://localhost:5000/api/admin/users?is_suspended=true" \
  -H "Authorization: Bearer <admin_token>"
```

#### 3. Suspend User
```bash
curl -X PUT http://localhost:5000/api/admin/users/suspend/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Violating community guidelines"}'
```

#### 4. Reactivate User
```bash
curl -X PUT http://localhost:5000/api/admin/users/reactivate/1 \
  -H "Authorization: Bearer <admin_token>"
```

#### 5. Block Product
```bash
curl -X PUT http://localhost:5000/api/admin/products/remove/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Inappropriate content"}'
```

#### 6. Unblock Product
```bash
curl -X PUT http://localhost:5000/api/admin/products/unblock/1 \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📊 Database Changes

### User Table
```sql
ALTER TABLE users 
ADD COLUMN is_suspended BOOLEAN DEFAULT false,
ADD COLUMN suspended_at DATETIME NULL,
ADD COLUMN suspended_by INT NULL,
ADD COLUMN suspension_reason TEXT NULL;
```

### Product Table
```sql
ALTER TABLE products 
ADD COLUMN product_status ENUM('active', 'blocked') DEFAULT 'active',
ADD COLUMN blocked_at DATETIME NULL,
ADD COLUMN blocked_by INT NULL,
ADD COLUMN block_reason TEXT NULL;
```

**Note**: Sequelize will handle these automatically on sync.

---

## ✅ Integration with Existing System

### User Wrapper Methods
- `User.suspend(userId, adminId, reason)`
- `User.reactivate(userId)`
- `User.findAllUsers(filters)`

### Product Wrapper Methods
- `Product.block(productId, adminId, reason)`
- `Product.unblock(productId)`

### Auth Middleware
- Enhanced to check `is_suspended` status
- Returns 403 with suspension reason

### Admin Routes
- Integrated with existing NGO verification routes
- Uses same authorization middleware
- Follows same logging pattern

---

## 🎯 Use Cases

### 1. Policy Violation
User violates terms of service → Admin suspends account with reason → User cannot access system

### 2. Inappropriate Content
Product contains inappropriate content → Admin blocks product → Product becomes unavailable

### 3. Account Recovery
User appeals suspension → Admin reviews → Admin reactivates account

### 4. Content Review
Product flagged by users → Admin reviews → Admin blocks or approves

### 5. Audit Trail
Admin actions tracked → Full history available → Accountability maintained

---

## 🚀 Future Enhancements

Potential improvements:
1. **Temporary Suspensions**: Time-limited suspensions
2. **Warning System**: Warnings before suspension
3. **Appeal Process**: User appeal workflow
4. **Bulk Actions**: Suspend/block multiple items
5. **Notification System**: Email users about actions
6. **Dashboard**: Admin dashboard with statistics
7. **Reports**: Generate admin action reports
8. **Auto-moderation**: AI-based content filtering

---

## 📁 Files Modified/Created

### Modified Files (5)
1. `database/models/User.sequelize.js` - Added suspension fields
2. `database/models/Product.sequelize.js` - Added moderation fields
3. `models/User.sequelize.wrapper.js` - Added suspend/reactivate methods
4. `models/Product.sequelize.wrapper.js` - Added block/unblock methods
5. `middleware/auth.js` - Added suspension check
6. `routes/admin.js` - Added user/product management endpoints

### Created Files (2)
1. `test-admin-management.js` - Test script
2. `ADMIN_MANAGEMENT_SYSTEM.md` - This documentation

---

## ✅ Compliance with Requirements

- ✅ User suspension with `is_suspended` field
- ✅ User reactivation endpoint
- ✅ Product moderation with `product_status` field
- ✅ Admin-only access with authorization
- ✅ All actions logged in AdminLog
- ✅ Follows existing wrapper architecture
- ✅ Migration-safe (nullable fields)

---

**Date**: February 27, 2026  
**Status**: ✅ Implemented and Ready for Testing  
**Version**: 1.0
