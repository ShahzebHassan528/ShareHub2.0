# 🏛️ NGO Verification System

## Overview

The NGO Verification System implements a complete workflow for admin approval/rejection of NGO registrations and restricts donations to only approved NGOs.

---

## 📋 Features Implemented

### 1. NGO Verification Status
- **Field**: `verification_status` ENUM('pending', 'approved', 'rejected')
- **Default**: 'pending'
- **Additional Fields**:
  - `verified_by` - Admin ID who approved/rejected
  - `verified_at` - Timestamp of approval
  - `rejection_reason` - Reason for rejection

### 2. Admin-Only APIs

#### GET /api/admin/ngos/pending
**Purpose**: Get all pending NGOs awaiting verification

**Authorization**: Admin only

**Response**:
```json
{
  "message": "Pending NGOs retrieved successfully",
  "count": 2,
  "ngos": [
    {
      "id": 1,
      "ngo_name": "Help Foundation",
      "registration_number": "NGO123456",
      "verification_status": "pending",
      "email": "contact@helpfoundation.org",
      "full_name": "John Doe",
      "phone": "1234567890"
    }
  ]
}
```

#### PUT /api/admin/ngo/approve/:id
**Purpose**: Approve an NGO

**Authorization**: Admin only

**Request**: No body required

**Response**:
```json
{
  "message": "NGO approved successfully",
  "ngo_id": 1,
  "status": "approved"
}
```

**Actions**:
- Sets `verification_status` to 'approved'
- Records `verified_by` (admin ID)
- Records `verified_at` (timestamp)
- Logs action in AdminLog table

#### PUT /api/admin/ngo/reject/:id
**Purpose**: Reject an NGO

**Authorization**: Admin only

**Request Body**:
```json
{
  "reason": "Invalid registration documents"
}
```

**Response**:
```json
{
  "message": "NGO rejected successfully",
  "ngo_id": 1,
  "status": "rejected",
  "reason": "Invalid registration documents"
}
```

**Actions**:
- Sets `verification_status` to 'rejected'
- Records `verified_by` (admin ID)
- Stores `rejection_reason`
- Logs action in AdminLog table

#### GET /api/admin/ngos/approved
**Purpose**: Get all approved NGOs

**Authorization**: Admin only

**Response**:
```json
{
  "message": "Approved NGOs retrieved successfully",
  "count": 5,
  "ngos": [...]
}
```

### 3. Role-Based Authorization Middleware

**Function**: `authorize(roles)`

**Usage**:
```javascript
router.get('/admin/ngos/pending', auth, authorize(['admin']), handler);
```

**Behavior**:
- Checks if user is authenticated
- Verifies user role is in allowed roles
- Returns 403 if unauthorized
- Logs authorization attempts

### 4. Donation Restriction

**Rule**: Donations can ONLY be made to approved NGOs

**Implementation**: `Donation.create()` method

**Check**:
```javascript
const ngo = await NGO.findByPk(ngo_id);

if (ngo.verification_status !== 'approved') {
  throw new Error('Donations can only be made to approved NGOs');
}
```

**Error Response**:
```json
{
  "error": "Donations can only be made to approved NGOs"
}
```

### 5. Admin Action Logging

**Table**: `admin_logs`

**Logged Actions**:
- `approve_ngo` - When admin approves an NGO
- `reject_ngo` - When admin rejects an NGO

**Log Entry**:
```json
{
  "admin_id": 34,
  "action": "approve_ngo",
  "target_type": "ngo",
  "target_id": 1,
  "details": {
    "ngo_name": "Help Foundation",
    "registration_number": "NGO123456",
    "previous_status": "pending"
  }
}
```

---

## 🔄 Workflow

### NGO Registration Flow
```
1. User signs up with role='ngo'
   ↓
2. NGO profile created with verification_status='pending'
   ↓
3. NGO appears in admin pending list
   ↓
4. Admin reviews NGO details
   ↓
5. Admin approves OR rejects
   ↓
6. If approved: NGO can receive donations
   If rejected: NGO cannot receive donations
```

### Donation Flow
```
1. User attempts to donate to NGO
   ↓
2. System checks NGO verification_status
   ↓
3. If status === 'approved':
     → Allow donation
     → Create donation record
   ↓
4. If status !== 'approved':
     → Reject donation
     → Return error message
```

---

## 🔐 Security

### Authentication
- All admin endpoints require valid JWT token
- Token must be in Authorization header: `Bearer <token>`

### Authorization
- Only users with role='admin' can access admin endpoints
- Non-admin users receive 403 Forbidden

### Validation
- NGO ID must exist
- Rejection reason is required for rejection
- Cannot approve/reject already processed NGOs

---

## 📊 Database Changes

### NGO Table
```sql
ALTER TABLE ngos 
MODIFY COLUMN verification_status ENUM('pending', 'approved', 'rejected') 
DEFAULT 'pending';
```

**Note**: Sequelize will handle this automatically on sync.

---

## 🧪 Testing

### Test Script
```bash
cd backend
node test-ngo-verification.js
```

### Manual Testing

#### 1. Get Pending NGOs
```bash
curl -X GET http://localhost:5000/api/admin/ngos/pending \
  -H "Authorization: Bearer <admin_token>"
```

#### 2. Approve NGO
```bash
curl -X PUT http://localhost:5000/api/admin/ngo/approve/1 \
  -H "Authorization: Bearer <admin_token>"
```

#### 3. Reject NGO
```bash
curl -X PUT http://localhost:5000/api/admin/ngo/reject/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Invalid documents"}'
```

#### 4. Test Unauthorized Access
```bash
curl -X GET http://localhost:5000/api/admin/ngos/pending \
  -H "Authorization: Bearer invalid_token"
```

Expected: 401 Unauthorized

---

## 📝 Code Files Modified/Created

### Modified Files
1. **`database/models/NGO.sequelize.js`**
   - Changed ENUM from 'verified' to 'approved'

2. **`models/NGO.sequelize.wrapper.js`**
   - Renamed `verify()` to `approve()`
   - Renamed `findVerified()` to `findApproved()`
   - Added `findById()` method

3. **`models/Donation.sequelize.wrapper.js`**
   - Added NGO verification check in `create()` method

4. **`middleware/auth.js`**
   - Added `authorize(roles)` function

5. **`server.js`**
   - Registered admin routes

### Created Files
1. **`routes/admin.js`**
   - Admin NGO verification endpoints
   - Authorization checks
   - Admin logging

2. **`test-ngo-verification.js`**
   - Comprehensive test script

3. **`NGO_VERIFICATION_SYSTEM.md`**
   - This documentation file

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | /api/admin/ngos/pending | ✅ | Admin | Get pending NGOs |
| GET | /api/admin/ngos/approved | ✅ | Admin | Get approved NGOs |
| PUT | /api/admin/ngo/approve/:id | ✅ | Admin | Approve NGO |
| PUT | /api/admin/ngo/reject/:id | ✅ | Admin | Reject NGO |

---

## ✅ Compliance with SRS

### Requirements Met
- ✅ NGO verification_status field (pending/approved/rejected)
- ✅ Admin-only approval/rejection APIs
- ✅ Role-based authorization middleware
- ✅ Donation restriction to approved NGOs only
- ✅ Admin action logging
- ✅ No modification to existing authentication
- ✅ Safe Sequelize usage

### Additional Features
- ✅ Detailed logging for debugging
- ✅ Comprehensive error handling
- ✅ Test script for verification
- ✅ Complete documentation

---

## 🚀 How to Use

### For Admins

1. **Login as admin**:
   ```
   POST /api/auth/signin
   Body: { email: "admin@marketplace.com", password: "admin123" }
   ```

2. **View pending NGOs**:
   ```
   GET /api/admin/ngos/pending
   Header: Authorization: Bearer <token>
   ```

3. **Approve an NGO**:
   ```
   PUT /api/admin/ngo/approve/1
   Header: Authorization: Bearer <token>
   ```

4. **Reject an NGO**:
   ```
   PUT /api/admin/ngo/reject/1
   Header: Authorization: Bearer <token>
   Body: { reason: "Invalid documents" }
   ```

### For Users

- Users can only donate to approved NGOs
- Attempting to donate to pending/rejected NGOs will fail with error message
- No changes needed in user workflow

---

## 📊 Status Transitions

```
pending → approved (by admin)
pending → rejected (by admin)
approved → (no further changes)
rejected → (no further changes)
```

**Note**: Once approved or rejected, status cannot be changed back to pending.

---

**Date**: February 27, 2026  
**Status**: ✅ Implemented and Ready for Testing  
**Version**: 1.0
