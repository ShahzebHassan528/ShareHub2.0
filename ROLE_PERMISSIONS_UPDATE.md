# Role Permissions Update - ShareHub 2.0

## Change Summary
**Date**: Updated based on real-world marketplace behavior
**Reason**: Allow all users to both buy AND sell items (like OLX, Facebook Marketplace)

---

## Previous System (Restrictive)

### Roles:
- **Buyer**: Could only purchase items ❌
- **Seller**: Could only sell items ❌
- **Problem**: Users needed multiple accounts to buy and sell

---

## Updated System (Flexible)

### Roles:
- **Buyer**: Can buy AND sell items ✅
- **Seller**: Can buy AND sell items ✅
- **Benefit**: Single account for all marketplace activities

---

## Updated Permissions Matrix

| Feature | Buyer | Seller | NGO | Admin |
|---------|-------|--------|-----|-------|
| **Browse Products** | ✅ | ✅ | ✅ | ✅ |
| **Add to Cart** | ✅ | ✅ | ✅ | ✅ |
| **Checkout** | ✅ | ✅ | ✅ | ✅ |
| **Add Product** | ✅ NEW | ✅ | ❌ | ✅ |
| **Edit Own Product** | ✅ NEW | ✅ | ❌ | ✅ |
| **Delete Own Product** | ✅ NEW | ✅ | ❌ | ✅ |
| **Request Swap** | ✅ | ✅ | ❌ | ✅ |
| **Receive Donations** | ❌ | ❌ | ✅ | ✅ |
| **Approve Sellers** | ❌ | ❌ | ❌ | ✅ |
| **Verify NGOs** | ❌ | ❌ | ❌ | ✅ |

---

## Technical Changes

### 1. Frontend Routes (App.jsx)
```javascript
// BEFORE: Only sellers could access
<Route path="/seller/products/add" 
  element={
    <ProtectedRoute requiredRole={ROLES.SELLER}>
      <AddProduct />
    </ProtectedRoute>
  } 
/>

// AFTER: All authenticated users can access
<Route path="/seller/products/add" 
  element={
    <ProtectedRoute>
      <AddProduct />
    </ProtectedRoute>
  } 
/>
```

### 2. Navigation (Navbar.jsx)
```javascript
// Added "Sell Item" button for all logged-in users
{isAuthenticated && (
  <Link to="/seller/products/add" className="nav-link">
    <i className="bi bi-plus-circle"></i>
    <span>Sell Item</span>
  </Link>
)}
```

### 3. Backend Permissions (ability.js)
```javascript
case 'buyer':
  // NEW: Buyers can also sell their own items
  can('create', 'Product');
  can('update', 'Product', { seller_id: user.seller_id });
  can('delete', 'Product', { seller_id: user.seller_id });
  // ... rest of buyer permissions
```

---

## User Flow Examples

### Example 1: Buyer Selling an Item
```
1. User logs in as "Buyer"
2. Clicks "Sell Item" in navbar
3. Fills product form (title, price, images, location)
4. Submits product
5. Product created successfully ✅
6. Can manage product in "My Products"
```

### Example 2: Seller Buying an Item
```
1. User logs in as "Seller"
2. Browses products
3. Adds item to cart
4. Proceeds to checkout
5. Order placed successfully ✅
```

---

## Benefits of This Approach

### 1. User Experience
- ✅ Single account for all activities
- ✅ No need to switch accounts
- ✅ Simpler registration process

### 2. Business Logic
- ✅ Matches real-world marketplace behavior (OLX, eBay, Facebook)
- ✅ Increases platform engagement
- ✅ More items listed = more transactions

### 3. Technical
- ✅ Cleaner codebase
- ✅ Fewer role checks
- ✅ Easier to maintain

---

## Security Considerations

### Ownership Protection
- Users can only edit/delete their OWN products
- CASL checks `seller_id` matches `user.seller_id`
- Backend validates ownership before any operation

### Admin Oversight
- Admin can still moderate all products
- Admin approval required for sellers (optional)
- Admin can block/remove inappropriate listings

---

## Database Schema (No Changes Required)

The existing schema already supports this:
```sql
products table:
- id
- seller_id (references users.id)
- title, description, price
- ...

users table:
- id
- role (buyer/seller/ngo/admin)
- ...
```

**Note**: `seller_id` in products table is just `user_id` - any user can be a seller!

---

## Future Enhancements

### Option 1: Remove Role Distinction Completely
```javascript
ROLES = {
  USER: 'user',     // Can buy + sell + swap + donate
  NGO: 'ngo',       // Can receive donations
  ADMIN: 'admin'    // Full access
}
```

### Option 2: Capability-Based System
```javascript
user = {
  id: 1,
  capabilities: ['buy', 'sell', 'swap', 'donate']
}
```

---

## Testing Checklist

- [x] Buyer can access /seller/products/add
- [x] Buyer can create product
- [x] Buyer can edit own product
- [x] Buyer cannot edit other's product
- [x] "Sell Item" button visible to all logged-in users
- [x] Backend CASL permissions updated
- [x] Frontend routes updated
- [x] No breaking changes to existing functionality

---

## Conclusion

This update makes ShareHub 2.0 more user-friendly and aligns with modern marketplace platforms where users can both buy and sell items seamlessly.

**Impact**: Positive - Increases platform usability and user engagement without compromising security.
