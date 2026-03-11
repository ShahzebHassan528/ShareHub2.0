# Database Setup Guide

## Prerequisites
- MySQL installed on your system
- Node.js and npm installed

## Setup Steps

### 1. Install MySQL Dependencies
```bash
cd backend
npm install
```

### 2. Create Database
Run the schema file to create database and tables:
```bash
mysql -u root -p < database/schema.sql
```

### 3. (Optional) Insert Sample Data
```bash
mysql -u root -p < database/seed.sql
```

### 4. Configure Environment
Update `backend/.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace_db
```

### 5. Start Server
```bash
npm run dev
```

## Database Structure

### User Roles
1. **Admin** - Manages entire platform
   - Approve/reject sellers
   - Verify NGOs
   - Monitor all products
   - View all transactions

2. **Seller** - Sells products
   - Create product listings
   - Set product condition (new, like_new, good, fair, poor)
   - Manage inventory
   - View sales

3. **Buyer** - Purchases products
   - Browse products
   - Buy products
   - Donate products to NGOs
   - Leave reviews

4. **NGO** - Receives donations
   - Receive product donations
   - Accept/reject donations
   - Manage donation requests

### Key Features
- Product condition tracking (new, like_new, good, fair, poor)
- Seller approval workflow
- NGO verification system
- Donation management
- Order tracking
- Review system
- Admin activity logs

## API Endpoints (To be implemented)

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Admin
- GET /api/admin/sellers/pending
- PUT /api/admin/sellers/:id/approve
- PUT /api/admin/sellers/:id/reject
- GET /api/admin/ngos/pending
- PUT /api/admin/ngos/:id/verify
- PUT /api/admin/ngos/:id/reject

### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products (seller only)
- PUT /api/products/:id (seller only)

### Donations
- POST /api/donations
- GET /api/donations/my-donations
- GET /api/donations/ngo/:ngoId

### Orders
- POST /api/orders
- GET /api/orders/my-orders
- GET /api/orders/:id
