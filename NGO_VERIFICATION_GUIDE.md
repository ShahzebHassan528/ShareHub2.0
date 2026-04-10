# NGO Verification Process

## How NGO Verification Works

### Step 1: NGO Registration
1. User signs up with role "NGO"
2. Fills NGO details (name, registration number, etc.)
3. Status: **Pending Approval**

### Step 2: Admin Approval
1. Admin logs into Admin Panel
2. Goes to NGO management section
3. Reviews pending NGO requests
4. Approves or rejects

### Step 3: NGO Access
1. After approval, NGO can access NGO Dashboard
2. Can receive donations
3. Can manage donation campaigns

---

## Admin Panel - NGO Verification

### How to Access:

1. **Login as Admin:**
   - Email: `admin@marketplace.com`
   - Password: `password123`

2. **Navigate to Admin Panel:**
   - URL: http://localhost:3000/admin/dashboard
   - Or click "Admin Panel" in navbar

3. **Go to NGO Management:**
   - Click "NGOs" in admin sidebar
   - Or go to: http://localhost:3000/admin/ngos

4. **View Pending NGOs:**
   - You'll see list of all NGOs
   - Filter by status: "Pending"
   - Each NGO will have "Approve" and "Reject" buttons

5. **Approve NGO:**
   - Click "Approve" button
   - NGO status changes to "Approved"
   - NGO can now access their dashboard

---

## Admin Panel Routes

### Main Admin Routes:
- `/admin/dashboard` - Admin Dashboard (overview)
- `/admin/users` - User Management
- `/admin/sellers` - Seller Verification
- `/admin/ngos` - NGO Verification ← **HERE**
- `/admin/products` - Product Management
- `/admin/activity` - Activity Logs

---

## NGO Verification Page Features

### What Admin Can See:
1. **NGO Details:**
   - NGO Name
   - Registration Number
   - Address
   - Website
   - Description
   - Contact Info

2. **Verification Status:**
   - Pending (yellow badge)
   - Approved (green badge)
   - Rejected (red badge)

3. **Actions:**
   - Approve Button (green)
   - Reject Button (red)
   - View Details

### What Admin Can Do:
- View all NGOs (pending, approved, rejected)
- Filter by status
- Approve pending NGOs
- Reject pending NGOs
- View NGO details
- See approval history

---

## Testing NGO Verification

### Test Scenario:

#### 1. Create Test NGO (if needed):
```javascript
// In browser console or via signup page
// Register as NGO with email: testngo@example.com
```

#### 2. Login as Admin:
- Email: `admin@marketplace.com`
- Password: `password123`

#### 3. Go to NGO Management:
- Navigate to: http://localhost:3000/admin/ngos

#### 4. Check Pending NGOs:
- Look for NGOs with "Pending" status
- Click "Approve" to approve

#### 5. Verify Approval:
- Status should change to "Approved"
- NGO can now login and access dashboard

---

## Database Tables

### NGOs Table:
```sql
- id
- user_id (links to users table)
- ngo_name
- registration_number
- address
- website
- description
- approval_status (pending/approved/rejected)
- approved_by (admin user_id)
- approved_at
- created_at
```

### Approval Status Values:
- `pending` - Waiting for admin approval
- `approved` - Approved by admin
- `rejected` - Rejected by admin

---

## Current NGOs in Database

Based on seed data:

1. **Help Foundation**
   - Email: `ngo1@example.com`
   - Status: Likely approved (seed data)

2. **Care Society**
   - Email: `ngo2@example.com`
   - Status: Likely approved (seed data)

---

## API Endpoints (for reference)

### Admin NGO Management:
- `GET /api/v1/admin/ngos` - Get all NGOs
- `GET /api/v1/admin/ngos/pending` - Get pending NGOs
- `PUT /api/v1/admin/ngos/:id/approve` - Approve NGO
- `PUT /api/v1/admin/ngos/:id/reject` - Reject NGO

---

## Quick Steps Summary

1. **Login as Admin** → `admin@marketplace.com` / `password123`
2. **Go to Admin Panel** → Click "Admin Panel" in navbar
3. **Click "NGOs"** → In admin sidebar
4. **View Pending NGOs** → Filter or scroll to find pending
5. **Click "Approve"** → NGO is now approved!

---

## Troubleshooting

### Issue: No pending NGOs showing
**Solution:** 
- Check if any NGOs are registered
- Check database: `SELECT * FROM ngos WHERE approval_status = 'pending'`

### Issue: Approve button not working
**Solution:**
- Check browser console for errors
- Check backend logs
- Verify admin permissions

### Issue: Can't access admin panel
**Solution:**
- Make sure logged in as admin
- Check role: `admin@marketplace.com` has role "admin"
- Clear cache and re-login

---

## Files to Check

### Frontend:
- `ShareHub2.0/frontend/src/pages/admin/AdminNGOs.jsx` - NGO management page
- `ShareHub2.0/frontend/src/layouts/AdminLayout.jsx` - Admin sidebar

### Backend:
- `ShareHub2.0/backend/controllers/admin.controller.js` - Admin actions
- `ShareHub2.0/backend/routes/v1/admin.js` - Admin routes
- `ShareHub2.0/backend/models/NGO.sequelize.wrapper.js` - NGO model

---

## Need Help?

If NGO verification page is not working:
1. Check if admin routes are properly configured
2. Check if AdminNGOs component exists
3. Check backend logs for API errors
4. Verify admin permissions in CASL

Let me know if you need help accessing or fixing the NGO verification page!
