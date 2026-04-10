# ShareHub 2.0 - User Credentials

## All Registered Users

### 1. Admin User
- **Name:** Admin User
- **Email:** admin@marketplace.com
- **Password:** admin123
- **Role:** admin
- **User ID:** 1

---

### 2. John Doe (Buyer)
- **Name:** John Doe
- **Email:** buyer1@example.com
- **Password:** password123
- **Role:** buyer
- **User ID:** 2
- **Seller Profile:** ID 3 (auto-created)
- **Products:** 1 product (ID: 13 - "Test iPhone")

---

### 3. Jane Smith (Buyer)
- **Name:** Jane Smith
- **Email:** buyer2@example.com
- **Password:** password123
- **Role:** buyer
- **User ID:** 3

---

### 4. Tech Store Owner (Seller)
- **Name:** Tech Store Owner
- **Email:** seller1@example.com
- **Password:** password123
- **Role:** seller
- **User ID:** 4
- **Seller Profile:** ID 1
- **Products:** Multiple products (IDs: 6-12)

---

### 5. Fashion Hub Owner (Seller)
- **Name:** Fashion Hub Owner
- **Email:** seller2@example.com
- **Password:** password123
- **Role:** seller
- **User ID:** 5

---

### 6. Help Foundation (NGO)
- **Name:** Help Foundation
- **Email:** ngo1@example.com
- **Password:** password123
- **Role:** ngo
- **User ID:** 6

---

### 7. Care Society (NGO)
- **Name:** Care Society
- **Email:** ngo2@example.com
- **Password:** password123
- **Role:** ngo
- **User ID:** 7

---

## Default Password
All users have the same password: **password123**

## Quick Login Guide

### To Test "My Products" Feature:
1. Login as **John Doe**
   - Email: `buyer1@example.com`
   - Password: `password123`
2. Click "My Products" or go to `/products/my`
3. You should see 1 product: "Test iPhone"

### To Test Admin Panel:
1. Login as **Admin User**
   - Email: `admin@marketplace.com`
   - Password: `password123`
2. Go to `/admin/dashboard`

### To Test Seller Dashboard:
1. Login as **Tech Store Owner**
   - Email: `seller1@example.com`
   - Password: `password123`
2. Go to `/seller/dashboard`

## Database Info

### Sellers Table:
- Seller ID 1 → User ID 4 (Tech Store Owner)
- Seller ID 3 → User ID 2 (John Doe - auto-created)

### Products Table:
- Products 6-12 → Seller ID 1 (Tech Store Owner)
- Product 13 → Seller ID 3 (John Doe)

## Notes
- All buyers can now add products (seller profile auto-created)
- Password is same for all users for testing purposes
- In production, use strong unique passwords
