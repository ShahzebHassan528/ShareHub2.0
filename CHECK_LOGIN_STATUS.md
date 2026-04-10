# Check Login Status - Quick Debug

## Issue
"Contact Seller" button redirects to login page instead of opening messages.

## Cause
You're not logged in OR token has expired/been cleared.

## Quick Check

### Step 1: Open Browser Console
Press F12 and run:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check if user data exists
console.log('User:', localStorage.getItem('user'));

// If token exists, decode it to see user info
const token = localStorage.getItem('token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('User ID:', payload.id);
    console.log('Role:', payload.role);
    console.log('Expires:', new Date(payload.exp * 1000));
  } catch (e) {
    console.log('Invalid token format');
  }
} else {
  console.log('❌ No token found - You are NOT logged in!');
}
```

### Step 2: Check Results

#### If Token Exists:
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User: {"id":2,"email":"buyer1@example.com",...}
```
→ You ARE logged in, but something else is wrong

#### If No Token:
```
Token: null
User: null
❌ No token found - You are NOT logged in!
```
→ You need to login again

---

## Solution 1: Login Again

### Quick Login:
1. Go to: http://localhost:3000/login
2. Use credentials:
   - **Buyer:** buyer1@example.com / password123
   - **Seller:** seller1@example.com / seller123
   - **Admin:** admin@marketplace.com / password123

3. After login, try "Contact Seller" again

---

## Solution 2: Fix Token Verification Issue

The issue might be that `authAPI.getCurrentUser()` endpoint doesn't exist or is failing.

### Check if endpoint exists:

```javascript
// In browser console after login:
fetch('http://localhost:5000/api/v1/users/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Profile API:', data))
.catch(err => console.error('Profile API Error:', err));
```

### If endpoint fails:
The AuthContext is trying to verify token on page load, and if it fails, it clears the token.

**Temporary Fix:** Comment out token verification in AuthContext.

---

## Solution 3: Disable Token Verification (Temporary)

If token keeps getting cleared, we can temporarily disable verification:

### Edit: `frontend/src/contexts/AuthContext.jsx`

Find this code:
```javascript
if (token && savedUser) {
  try {
    const userData = await authAPI.getCurrentUser();
    setUser(userData.user || userData);
    setIsAuthenticated(true);
  } catch (error) {
    clearAuthData();  // ← This clears token on error
    setUser(null);
    setIsAuthenticated(false);
  }
}
```

Change to:
```javascript
if (token && savedUser) {
  // Trust the saved data without verification
  setUser(savedUser);
  setIsAuthenticated(true);
}
```

This will trust the localStorage data without verifying with backend.

---

## Solution 4: Check Backend API

Make sure backend has the profile endpoint:

```
GET /api/v1/users/profile
Headers: Authorization: Bearer TOKEN
```

Check in:
- `backend/routes/v1/users.js`
- `backend/controllers/user.controller.js`

---

## Quick Test

### Test 1: Login and Check Token
```javascript
// 1. Login
fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'buyer1@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('✅ Token saved!');
    console.log('Now refresh page and try Contact Seller');
  }
});
```

### Test 2: Verify Token Persists
```javascript
// After login, refresh page and check:
console.log('Token after refresh:', localStorage.getItem('token'));
// Should still be there
```

---

## Common Issues

### Issue 1: Token Cleared on Page Refresh
**Cause:** AuthContext verification failing
**Fix:** Disable verification (Solution 3) or fix backend endpoint

### Issue 2: Login Works but Redirects to Login
**Cause:** Token not being saved properly
**Fix:** Check if login API returns token correctly

### Issue 3: "Contact Seller" Always Redirects
**Cause:** ProtectedRoute checking isAuthenticated which is false
**Fix:** Make sure login sets isAuthenticated to true

---

## Immediate Workaround

If you need to demo messaging RIGHT NOW:

1. **Open Browser Console**
2. **Run this code:**
```javascript
// Manually set auth state
localStorage.setItem('token', 'PASTE_VALID_TOKEN_HERE');
localStorage.setItem('user', JSON.stringify({
  id: 2,
  email: 'buyer1@example.com',
  full_name: 'John Doe',
  role: 'buyer'
}));

// Refresh page
location.reload();
```

3. **Get valid token by:**
   - Login via Postman
   - Copy token from response
   - Paste in code above

---

## Debug Checklist

- [ ] Check localStorage for token
- [ ] Check if token is valid (not expired)
- [ ] Try logging in again
- [ ] Check browser console for errors
- [ ] Check if AuthContext is clearing token
- [ ] Check if backend profile endpoint exists
- [ ] Try manual token set (workaround)

---

## Next Steps

1. **First:** Check localStorage (Step 1)
2. **If no token:** Login again (Solution 1)
3. **If token exists but still redirects:** Check AuthContext (Solution 3)
4. **If still not working:** Check backend API (Solution 4)

Let me know what you find in localStorage!
