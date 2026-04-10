# ShareHub 2.0 - Complete Project Demonstration Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [How to Start Servers](#how-to-start-servers)
3. [Frontend Demo Flow](#frontend-demo-flow)
4. [Backend API Testing (Postman)](#backend-api-testing-postman)
5. [Key Features to Show](#key-features-to-show)
6. [User Credentials](#user-credentials)

---

## Project Overview

**ShareHub 2.0** - A marketplace platform with:
- **Buy/Sell Products** - Users can list and purchase items
- **Product Swapping** - Exchange items without money
- **NGO Donations** - Support charitable organizations
- **Admin Panel** - Manage users, sellers, NGOs, products
- **Role-Based Access** - Buyer, Seller, NGO, Admin roles
- **Map Integration** - Location-based product search (Leaflet + OpenStreetMap)

### Tech Stack:
- **Frontend:** React + Vite, React Router, Bootstrap 5
- **Backend:** Node.js + Express, MySQL + Sequelize ORM
- **Authentication:** JWT tokens
- **Authorization:** CASL (role-based permissions)
- **Maps:** Leaflet + OpenStreetMap (free, no API key)
- **Caching:** Redis (optional)

---

## How to Start Servers

### Prerequisites:
- XAMPP running (MySQL on port 3306)
- Node.js installed
- Both frontend and backend dependencies installed

### Start Backend:
```bash
cd ShareHub2.0/backend
npm start
```
**Backend URL:** http://localhost:5000

### Start Frontend:
```bash
cd ShareHub2.0/frontend
npm run dev
```
**Frontend URL:** http://localhost:3000

### Verify Servers:
- Backend: http://localhost:5000/api/v1/products (should return products)
- Frontend: http://localhost:3000 (should show homepage)

---

## Frontend Demo Flow

### 1. Homepage (Public)
**URL:** http://localhost:3000

**Show:**
- Hero section with marketplace overview
- Featured products
- Categories
- Navigation bar
- Footer

**Actions:**
- Browse products without login
- View product details
- See NGO listings

---

### 2. User Registration & Login

#### Register New User:
**URL:** http://localhost:3000/signup

**Show:**
- Registration form
- Role selection (Buyer, Seller, NGO)
- Form validation

#### Login:
**URL:** http://localhost:3000/login

**Test Accounts:**
- **Admin:** admin@marketplace.com / password123
- **Buyer:** buyer1@example.com / password123
- **Seller:** seller1@example.com / seller123
- **NGO:** ngo1@example.com / password123

---

### 3. Buyer Dashboard
**Login as:** buyer1@example.com / password123

**URL:** http://localhost:3000/buyer/dashboard

**Show:**
- Order history
- Favorite products
- Recent purchases
- Profile information

**Key Features:**
- Browse products: http://localhost:3000/products
- Add to cart
- Checkout process
- View order details
- Message sellers

---

### 4. Seller Dashboard
**Login as:** seller1@example.com / seller123

**URL:** http://localhost:3000/seller/dashboard

**Show:**
- Sales overview
- Revenue statistics
- Product management
- Order management

**Key Features:**
- **Add Product:** http://localhost:3000/products/add
  - Upload images
  - Set location on map (Leaflet)
  - Set price, condition, description
- **My Products:** http://localhost:3000/products/my
  - View all listed products
  - Edit/Delete products
  - Toggle availability
- **Orders:** http://localhost:3000/seller/orders
  - View incoming orders
  - Update order status

---

### 5. Product Swapping
**URL:** http://localhost:3000/swaps/explore

**Show:**
- Available items for swap
- Create swap offer
- View swap requests
- Accept/Reject swaps

**My Swaps:** http://localhost:3000/swaps/my
- Sent offers
- Received offers
- Swap history

---

### 6. NGO Features
**Login as:** ngo1@example.com / password123

**URL:** http://localhost:3000/ngo/dashboard

**Show:**
- Donation campaigns
- Received donations
- Donation statistics
- NGO profile

**Public NGO Listing:** http://localhost:3000/ngos
- All approved NGOs
- Donation buttons
- NGO details

---

### 7. Admin Panel
**Login as:** admin@marketplace.com / password123

**URL:** http://localhost:3000/admin/dashboard

**Show:**
- **Dashboard:** Overview statistics
- **Users:** http://localhost:3000/admin/users
  - View all users
  - Suspend/Activate users
  - User details
- **Sellers:** http://localhost:3000/admin/sellers
  - Pending seller approvals
  - Approve/Reject sellers
- **NGOs:** http://localhost:3000/admin/ngos
  - Pending NGO approvals
  - Approve/Reject NGOs
- **Products:** http://localhost:3000/admin/products
  - View all products
  - Block/Unblock products
- **Activity Logs:** http://localhost:3000/admin/activity
  - Admin action history

---

### 8. Map Integration (Key Feature!)
**Show in:**
- Product Detail Page: http://localhost:3000/products/:id
  - Shows product location on map
  - Interactive Leaflet map
- Add Product Page: http://localhost:3000/products/add
  - Click on map to set location
  - Reverse geocoding (address from coordinates)
- Nearby Products: http://localhost:3000/products?nearby=true
  - Location-based search

**Technology:** Leaflet + OpenStreetMap (completely free, no API key needed!)

---

### 9. Messaging System
**URL:** http://localhost:3000/messages

**Show:**
- Chat list
- Real-time messaging
- Unread message count
- Conversation history

---

### 10. Notifications
**URL:** http://localhost:3000/notifications

**Show:**
- Order notifications
- Swap notifications
- Admin notifications
- Unread count badge

---

## Backend API Testing (Postman)

### Postman Collection Setup

#### Base URL:
```
http://localhost:5000/api/v1
```

#### Headers (for authenticated requests):
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

### 1. Authentication APIs

#### Register User
```
POST /api/v1/auth/register
Body (JSON):
{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User",
  "phone": "1234567890",
  "role": "buyer"
}
```

#### Login
```
POST /api/v1/auth/login
Body (JSON):
{
  "email": "buyer1@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "buyer1@example.com",
    "full_name": "John Doe",
    "role": "buyer"
  }
}
```
**Copy the token for subsequent requests!**

---

### 2. Product APIs

#### Get All Products
```
GET /api/v1/products
Query Params (optional):
- category: electronics
- minPrice: 1000
- maxPrice: 50000
- search: iphone
```

#### Get Product by ID
```
GET /api/v1/products/13
```

#### Get Nearby Products (Location-based)
```
GET /api/v1/products/nearby?lat=31.5204&lng=74.3587&radius=10
```

#### Get My Products (Authenticated)
```
GET /api/v1/products/my
Headers:
Authorization: Bearer YOUR_TOKEN
```

#### Create Product (Authenticated)
```
POST /api/v1/products
Headers:
Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "title": "iPhone 14 Pro",
  "description": "Brand new iPhone 14 Pro, 256GB",
  "price": 250000,
  "quantity": 1,
  "product_condition": "new",
  "location": "Lahore",
  "latitude": 31.5204,
  "longitude": 74.3587,
  "address": "Lahore, Pakistan"
}
```

#### Update Product (Authenticated)
```
PUT /api/v1/products/13
Headers:
Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "price": 240000,
  "is_available": true
}
```

#### Delete Product (Authenticated)
```
DELETE /api/v1/products/13
Headers:
Authorization: Bearer YOUR_TOKEN
```

---

### 3. Order APIs

#### Create Order (Authenticated)
```
POST /api/v1/orders
Headers:
Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "items": [
    {
      "product_id": 13,
      "quantity": 1,
      "price": 250000
    }
  ],
  "shipping_address": "123 Main St, Lahore",
  "payment_method": "cash_on_delivery"
}
```

#### Get My Orders (Authenticated)
```
GET /api/v1/orders/my
Headers:
Authorization: Bearer YOUR_TOKEN
```

#### Get Order by ID (Authenticated)
```
GET /api/v1/orders/123
Headers:
Authorization: Bearer YOUR_TOKEN
```

---

### 4. Swap APIs

#### Get All Swaps
```
GET /api/v1/swaps
```

#### Create Swap Offer (Authenticated)
```
POST /api/v1/swaps
Headers:
Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "offered_product_id": 13,
  "requested_product_id": 14,
  "message": "Would you like to swap?"
}
```

#### Get My Swaps (Authenticated)
```
GET /api/v1/swaps/my
Headers:
Authorization: Bearer YOUR_TOKEN
```

#### Accept Swap (Authenticated)
```
PUT /api/v1/swaps/5/accept
Headers:
Authorization: Bearer YOUR_TOKEN
```

---

### 5. Donation APIs

#### Get All NGOs
```
GET /api/v1/ngos
```

#### Create Donation (Authenticated)
```
POST /api/v1/donations
Headers:
Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "ngo_id": 1,
  "amount": 5000,
  "payment_method": "credit_card",
  "message": "Keep up the good work!"
}
```

#### Get My Donations (Authenticated)
```
GET /api/v1/donations/my
Headers:
Authorization: Bearer YOUR_TOKEN
```

---

### 6. Admin APIs (Admin Only)

#### Get All Users (Admin)
```
GET /api/v1/admin/users
Headers:
Authorization: Bearer ADMIN_TOKEN
```

#### Suspend User (Admin)
```
PUT /api/v1/admin/users/2/suspend
Headers:
Authorization: Bearer ADMIN_TOKEN
Body (JSON):
{
  "reason": "Violation of terms"
}
```

#### Get Pending Sellers (Admin)
```
GET /api/v1/admin/sellers/pending
Headers:
Authorization: Bearer ADMIN_TOKEN
```

#### Approve Seller (Admin)
```
PUT /api/v1/admin/sellers/1/approve
Headers:
Authorization: Bearer ADMIN_TOKEN
```

#### Get Pending NGOs (Admin)
```
GET /api/v1/admin/ngos/pending
Headers:
Authorization: Bearer ADMIN_TOKEN
```

#### Approve NGO (Admin)
```
PUT /api/v1/admin/ngos/1/approve
Headers:
Authorization: Bearer ADMIN_TOKEN
```

#### Block Product (Admin)
```
PUT /api/v1/admin/products/13/block
Headers:
Authorization: Bearer ADMIN_TOKEN
Body (JSON):
{
  "reason": "Inappropriate content"
}
```

---

### 7. Message APIs

#### Get My Conversations (Authenticated)
```
GET /api/v1/messages
Headers:
Authorization: Bearer YOUR_TOKEN
```

#### Get Conversation with User (Authenticated)
```
GET /api/v1/messages/4
Headers:
Authorization: Bearer YOUR_TOKEN
```

#### Send Message (Authenticated)
```
POST /api/v1/messages
Headers:
Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "receiver_id": 4,
  "message": "Is this product still available?"
}
```

---

### 8. Notification APIs

#### Get My Notifications (Authenticated)
```
GET /api/v1/notifications
Headers:
Authorization: Bearer YOUR_TOKEN
```

#### Mark as Read (Authenticated)
```
PUT /api/v1/notifications/5/read
Headers:
Authorization: Bearer YOUR_TOKEN
```

---

### 9. User Profile APIs

#### Get My Profile (Authenticated)
```
GET /api/v1/users/profile
Headers:
Authorization: Bearer YOUR_TOKEN
```

#### Update Profile (Authenticated)
```
PUT /api/v1/users/profile
Headers:
Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "full_name": "Updated Name",
  "phone": "9876543210",
  "address": "New Address"
}
```

---

### 10. Dashboard APIs

#### Get Dashboard Stats (Authenticated)
```
GET /api/v1/dashboard
Headers:
Authorization: Bearer YOUR_TOKEN
```

---

## Key Features to Show Sir

### 1. Role-Based Access Control (CASL)
**Show:**
- Different dashboards for different roles
- Permission-based UI (buttons show/hide based on role)
- API-level authorization (try accessing admin API as buyer - should fail)

**Demo:**
- Login as buyer → Can't access admin panel
- Login as admin → Can access everything
- Login as seller → Can manage own products only

---

### 2. Map Integration (Unique Feature!)
**Show:**
- **Add Product:** Click on map to set location
- **Product Detail:** View product location on map
- **Nearby Search:** Find products near you
- **Technology:** Leaflet + OpenStreetMap (free!)

**Why it's impressive:**
- No API key needed (unlike Google Maps)
- Fully functional location picker
- Reverse geocoding (coordinates → address)
- Distance-based search

---

### 3. Auto Seller Profile Creation
**Show:**
- Buyer can list products without being a seller
- System automatically creates seller profile
- Seamless user experience

**Demo:**
- Login as buyer
- Click "Sell Item"
- Add product
- Check database - seller profile auto-created!

---

### 4. Product Swapping System
**Show:**
- Unique feature - exchange items without money
- Offer your product for someone else's product
- Accept/Reject swap offers
- Swap history

---

### 5. NGO Donation System
**Show:**
- Support charitable organizations
- Donation tracking
- NGO verification by admin
- Donation history

---

### 6. Admin Management System
**Show:**
- User management (suspend/activate)
- Seller verification
- NGO verification
- Product moderation (block/unblock)
- Activity logs (audit trail)

---

### 7. Messaging System
**Show:**
- Buyer-Seller communication
- Real-time chat
- Unread message count
- Conversation history

---

### 8. Complete E-commerce Flow
**Show:**
- Browse products
- Add to cart
- Checkout
- Order tracking
- Order management (seller side)

---

## Postman Collection Import

Create a file `ShareHub_Postman_Collection.json` with all APIs:

```json
{
  "info": {
    "name": "ShareHub 2.0 API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api/v1"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Demo Script for Sir

### 1. Introduction (2 minutes)
"Sir, this is ShareHub 2.0 - a complete marketplace platform with buy/sell, swapping, and NGO donation features."

### 2. Frontend Demo (10 minutes)
- Show homepage
- Register/Login
- Browse products
- Add product with map location
- View product on map
- Create swap offer
- Donate to NGO
- Admin panel (user/seller/NGO management)

### 3. Backend API Demo (5 minutes)
- Open Postman
- Show authentication (login → get token)
- Show product APIs (CRUD)
- Show location-based search
- Show admin APIs (with authorization)

### 4. Key Features Highlight (3 minutes)
- Map integration (Leaflet + OpenStreetMap)
- Role-based access (CASL)
- Auto seller profile creation
- Product swapping
- Admin management

### 5. Technical Stack (2 minutes)
- Frontend: React + Vite, Bootstrap 5
- Backend: Node.js + Express
- Database: MySQL + Sequelize ORM
- Auth: JWT + CASL
- Maps: Leaflet (free!)

---

## User Credentials Summary

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marketplace.com | password123 |
| Buyer | buyer1@example.com | password123 |
| Seller | seller1@example.com | seller123 |
| NGO | ngo1@example.com | password123 |

---

## Important URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/v1
- **Admin Panel:** http://localhost:3000/admin/dashboard

---

## Files to Show (Code Review)

### Backend Architecture:
- `backend/server.js` - Entry point
- `backend/controllers/` - MVC controllers
- `backend/models/` - Sequelize models
- `backend/routes/v1/` - API routes
- `backend/permissions/ability.js` - CASL permissions

### Frontend Architecture:
- `frontend/src/App.jsx` - Routes
- `frontend/src/pages/` - Page components
- `frontend/src/components/` - Reusable components
- `frontend/src/api/` - API client
- `frontend/src/contexts/` - React contexts

---

Good luck with your demo! 🚀
