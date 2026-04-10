# Browser Testing Instructions

## Issue: Products not listing in "My Products" page

## Quick Test Steps

### Method 1: Test API Directly (Recommended)

1. Open file: `ShareHub2.0/TEST_API_DIRECTLY.html` in browser
2. Click "Login as Buyer (John Doe)" or "Login as Seller (Tech Store)"
3. Click "Get My Products"
4. Check output - should show products

### Method 2: Test in Main App

1. Open browser: http://localhost:3000
2. Open DevTools (F12)
3. Go to Console tab
4. Clear console (Ctrl + L)

#### Login:
- Email: `buyer1@example.com` (John Doe - has 1 product)
- OR Email: `seller1@example.com` (Tech Store - has multiple products)
- Password: `password123` (buyer) or `seller123` (seller)

#### Navigate to My Products:
- Click "My Products" in menu
- OR go to: http://localhost:3000/products/my

#### Check Console Logs:

**Expected logs:**
```
🎯 SellerProducts component mounted!
🎯 SellerProducts useEffect triggered
🔍 SellerProducts: fetchProducts called
🔐 API Request: GET /v1/products/my
   Token present: true
   Authorization header set
✅ API Response: /v1/products/my
   Status: 200
   Data: { success: true, count: X, products: [...] }
✅ Response received: { success: true, count: X, products: [...] }
✅ State updated with X products
✅ fetchProducts completed
```

**If component not mounting:**
```
(No logs at all)
```
→ Route issue or component not rendering

**If token missing:**
```
🎯 SellerProducts component mounted!
🔐 API Request: GET /v1/products/my
   Token present: false
⚠️  No token found in storage!
```
→ Not logged in or token expired

**If API error:**
```
❌ API Error: /v1/products/my
   Error: {...}
❌ Error in fetchProducts: ...
```
→ Backend issue or permission problem

### Method 3: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to `/products/my`
4. Look for request to `/v1/products/my`

**Check:**
- Request Headers → Should have `Authorization: Bearer ...`
- Response → Should be 200 OK
- Response Data → Should have `products` array

### Method 4: Check localStorage

In browser console, run:
```javascript
// Check if logged in
console.log('Token:', localStorage.getItem('token'));

// Decode token to see user info
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('User ID:', payload.id);
  console.log('Role:', payload.role);
}
```

## Common Issues & Fixes

### Issue 1: Component Not Mounting
**Symptom:** No console logs at all
**Fix:** 
- Hard refresh: Ctrl + Shift + R
- Clear cache: DevTools → Application → Clear storage
- Check if route exists in App.jsx

### Issue 2: Token Missing
**Symptom:** "No token found in storage"
**Fix:**
- Login again
- Check if login was successful
- Check localStorage: `localStorage.getItem('token')`

### Issue 3: 401 Unauthorized
**Symptom:** "Session expired" error
**Fix:**
- Clear localStorage: `localStorage.clear()`
- Login again

### Issue 4: Empty Products Array
**Symptom:** API returns `{ count: 0, products: [] }`
**Fix:**
- Check if user has created any products
- Run: `node ShareHub2.0/backend/check-user2-products.js`
- Create a product using "Sell Item" button

### Issue 5: Wrong Products Showing
**Symptom:** Seeing other users' products
**Fix:**
- Check backend logs for seller_id filtering
- Verify `/my` endpoint is being called (not `/products`)

## Backend Verification

### Check if endpoint is hit:
In backend terminal, you should see:
```
🎯 Route /my hit! User: X UserName
🔍 getMyProducts called for user_id: X
🔍 Found seller: ID Y
🔷 Product.findBySeller() called for seller: Y
✅ Found Z products for seller Y
```

### If not seeing these logs:
- Frontend is not calling `/my` endpoint
- Check Network tab to see which endpoint is being called
- Check if route is correct in frontend

## Manual API Test

### Using curl:
```bash
# Login first
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer1@example.com","password":"password123"}'

# Copy token from response, then:
curl -X GET http://localhost:5000/api/v1/products/my \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using browser console:
```javascript
// Login
fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'buyer1@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Token:', data.token);
  localStorage.setItem('token', data.token);
  
  // Get my products
  return fetch('http://localhost:5000/api/v1/products/my', {
    headers: { 'Authorization': 'Bearer ' + data.token }
  });
})
.then(r => r.json())
.then(data => console.log('My Products:', data));
```

## What to Report

After testing, please provide:

1. **Console Output:** All logs from browser console
2. **Network Tab:** Screenshot of `/my` request (if any)
3. **Backend Logs:** Copy from backend terminal
4. **localStorage:** Output of `localStorage.getItem('token')`
5. **Which method worked:** Did TEST_API_DIRECTLY.html work?

This will help identify exactly where the issue is!
