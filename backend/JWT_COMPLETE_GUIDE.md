# 🔐 JWT Token Complete Implementation Guide (Urdu/English)

## JWT Kya Hai?

JWT (JSON Web Token) ek secure tarika hai authentication ke liye. Ye ek encoded string hoti hai jo 3 parts mein divided hoti hai:

```
header.payload.signature
```

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlciI6ImFkbWluIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## 1️⃣ TOKEN GENERATION (Token Kaise Banta Hai)

### Installation
```bash
npm install jsonwebtoken
```

### Code Example - Signup/Signin mein Token Generate karna

**File**: `routes/auth.js`

```javascript
const jwt = require('jsonwebtoken');

// Signup ke baad token generate karo
router.post('/signup', async (req, res) => {
  try {
    // User create karo
    const userId = await User.create({
      email: req.body.email,
      password: hashedPassword,
      full_name: req.body.full_name,
      role: req.body.role
    });

    // ✅ TOKEN GENERATE KARO
    const token = jwt.sign(
      { 
        id: userId,      // User ID (payload mein)
        role: req.body.role  // User role (payload mein)
      },
      process.env.JWT_SECRET,  // Secret key (.env file se)
      { 
        expiresIn: '7d'  // Token 7 din baad expire hoga
      }
    );

    // Token client ko bhejo
    res.status(201).json({
      message: 'Account created successfully',
      token: token,  // ⬅️ Ye token frontend ko milega
      user: { id: userId, email: req.body.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Signin mein bhi same process
router.post('/signin', async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);
    
    // Password check karo
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ TOKEN GENERATE KARO
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: token,  // ⬅️ Token frontend ko
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign in' });
  }
});
```

### Environment Variable (.env file)

```env
JWT_SECRET=your_super_secret_key_here_minimum_32_characters_long
```

⚠️ **Important**: JWT_SECRET ko kabhi bhi code mein hardcode na karo!

---

## 2️⃣ TOKEN KO REQUEST MEIN ATTACH KARNA

### Frontend (React/JavaScript) se Token Bhejne ka Tarika

```javascript
// Login ke baad token save karo
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  // ✅ TOKEN KO LOCALSTORAGE MEIN SAVE KARO
  localStorage.setItem('token', data.token);
  
  return data;
};

// Har protected request mein token bhejo
const getProfile = async () => {
  // ✅ TOKEN KO LOCALSTORAGE SE LO
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/users/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // ✅ AUTHORIZATION HEADER MEIN TOKEN BHEJO
      'Authorization': `Bearer ${token}`  // ⬅️ "Bearer " prefix zaroori hai
    }
  });

  return await response.json();
};

// Logout
const logout = () => {
  // ✅ TOKEN KO DELETE KARO
  localStorage.removeItem('token');
};
```

### Axios ke saath (Alternative)

```javascript
import axios from 'axios';

// Axios instance banao with default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Har request mein automatically token add karo
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Use karo
const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};
```

---

## 3️⃣ TOKEN VERIFICATION (Middleware mein Token Check karna)

### Auth Middleware

**File**: `middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // ✅ STEP 1: Header se token nikalo
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // "Bearer eyJhbGc..." se "eyJhbGc..." nikalo
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('🔍 Token received:', token.substring(0, 20) + '...');

    // ✅ STEP 2: Token ko verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Token verified successfully');
    console.log('   User ID:', decoded.id);
    console.log('   Role:', decoded.role);
    console.log('   Expires at:', new Date(decoded.exp * 1000));

    // ✅ STEP 3: Database se user ko fetch karo
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // ✅ STEP 4: User ko request object mein attach karo
    req.user = user;      // ⬅️ Ab route handlers mein req.user available hai
    req.token = token;    // ⬅️ Token bhi save kar lo
    
    // ✅ STEP 5: Next middleware/route handler ko call karo
    next();
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    // Token expire ho gaya
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    
    // Token invalid hai
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Authentication failed. Please login again.'
      });
    }
    
    // Koi aur error
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

module.exports = { auth };
```

---

## 4️⃣ MIDDLEWARE KO ROUTES MEIN USE KARNA

### Protected Routes

```javascript
const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ❌ PUBLIC ROUTE - Koi bhi access kar sakta hai
router.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// ✅ PROTECTED ROUTE - Sirf logged-in users
router.get('/profile', auth, async (req, res) => {
  // req.user automatically available hai (middleware se)
  res.json({
    user: req.user  // ⬅️ User data middleware se aaya
  });
});

// ✅ PROTECTED ROUTE - Profile update
router.put('/profile', auth, async (req, res) => {
  const userId = req.user.id;  // ⬅️ Middleware se user ID
  
  await User.updateProfile(userId, req.body);
  
  res.json({ message: 'Profile updated' });
});

// ✅ MULTIPLE MIDDLEWARES - Auth + Role check
const { auth, authorize } = require('../middleware/auth');

router.delete('/users/:id', auth, authorize(['admin']), async (req, res) => {
  // Sirf admin hi access kar sakta hai
  await User.delete(req.params.id);
  res.json({ message: 'User deleted' });
});
```

---

## 5️⃣ TOKEN EXPIRATION HANDLING

### Backend mein Expiry Set karna

```javascript
// Token generate karte waqt expiry set karo
const token = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { 
    expiresIn: '7d'  // Options:
    // '1h'  = 1 hour
    // '24h' = 24 hours
    // '7d'  = 7 days
    // '30d' = 30 days
  }
);
```

### Frontend mein Expiry Handle karna

```javascript
// Axios interceptor for handling expired tokens
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expire ho gaya ya invalid hai
      
      if (error.response.data.error === 'Token expired') {
        // User ko login page par redirect karo
        localStorage.removeItem('token');
        window.location.href = '/login';
        
        alert('Your session has expired. Please login again.');
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Token Refresh Strategy (Advanced)

```javascript
// Refresh token implementation
router.post('/refresh-token', async (req, res) => {
  try {
    const oldToken = req.body.token;
    
    // Old token ko verify karo (ignoreExpiration: true)
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, {
      ignoreExpiration: true
    });
    
    // Check if token expired recently (within 1 day)
    const now = Math.floor(Date.now() / 1000);
    const timeSinceExpiry = now - decoded.exp;
    
    if (timeSinceExpiry > 86400) { // 1 day = 86400 seconds
      return res.status(401).json({ error: 'Token expired too long ago' });
    }
    
    // User ko verify karo
    const user = await User.findById(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    
    // Naya token generate karo
    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Token refreshed',
      token: newToken
    });
    
  } catch (error) {
    res.status(401).json({ error: 'Failed to refresh token' });
  }
});
```

---

## 6️⃣ TOKEN SECURITY BEST PRACTICES

### ✅ DO's (Ye karo)

1. **JWT_SECRET ko strong rakho**
   ```env
   # ❌ Weak
   JWT_SECRET=secret
   
   # ✅ Strong
   JWT_SECRET=a8f5f167f44f4964e6c998dee827110c03f0d0c7e5c87f2a9d1e2f3b4c5d6e7f
   ```

2. **HTTPS use karo production mein**
   - HTTP par token send karna insecure hai

3. **Token ko localStorage mein save karo**
   ```javascript
   localStorage.setItem('token', token);
   ```

4. **Expiry time reasonable rakho**
   ```javascript
   expiresIn: '7d'  // ✅ Good for web apps
   expiresIn: '1h'  // ✅ Good for sensitive operations
   ```

5. **Token ko logout par delete karo**
   ```javascript
   localStorage.removeItem('token');
   ```

### ❌ DON'Ts (Ye mat karo)

1. **Token ko URL mein mat bhejo**
   ```javascript
   // ❌ Wrong
   fetch(`/api/profile?token=${token}`)
   
   // ✅ Correct
   fetch('/api/profile', {
     headers: { Authorization: `Bearer ${token}` }
   })
   ```

2. **Sensitive data token mein mat rakho**
   ```javascript
   // ❌ Wrong - Password token mein
   jwt.sign({ id: 1, password: 'secret123' }, secret)
   
   // ✅ Correct - Sirf ID aur role
   jwt.sign({ id: 1, role: 'user' }, secret)
   ```

3. **JWT_SECRET ko code mein hardcode mat karo**
   ```javascript
   // ❌ Wrong
   jwt.sign(data, 'mysecret')
   
   // ✅ Correct
   jwt.sign(data, process.env.JWT_SECRET)
   ```

---

## 7️⃣ COMPLETE FLOW DIAGRAM

```
┌─────────────┐
│   CLIENT    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /api/auth/signin
       │    { email, password }
       ▼
┌─────────────────────────────────────┐
│         BACKEND SERVER              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   routes/auth.js             │  │
│  │                              │  │
│  │  1. Email se user dhundo    │  │
│  │  2. Password verify karo    │  │
│  │  3. JWT token generate karo │  │
│  │     jwt.sign({id, role})    │  │
│  └──────────────────────────────┘  │
│                                     │
└──────┬──────────────────────────────┘
       │
       │ 2. Response
       │    { token: "eyJhbGc..." }
       ▼
┌─────────────┐
│   CLIENT    │
│             │
│  localStorage.setItem('token')     │
└──────┬──────┘
       │
       │ 3. GET /api/users/profile
       │    Headers: { Authorization: "Bearer eyJhbGc..." }
       ▼
┌─────────────────────────────────────┐
│         BACKEND SERVER              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   middleware/auth.js         │  │
│  │                              │  │
│  │  1. Header se token nikalo  │  │
│  │  2. jwt.verify(token)       │  │
│  │  3. User fetch karo         │  │
│  │  4. req.user = user         │  │
│  │  5. next()                  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   routes/users.js            │  │
│  │                              │  │
│  │  req.user se data lo        │  │
│  │  Response bhejo             │  │
│  └──────────────────────────────┘  │
│                                     │
└──────┬──────────────────────────────┘
       │
       │ 4. Response
       │    { profile: {...} }
       ▼
┌─────────────┐
│   CLIENT    │
│             │
│  Profile display karo              │
└─────────────┘
```

---

## 8️⃣ TESTING JWT

### Postman mein Test karna

1. **Login Request**
   ```
   POST http://localhost:5000/api/auth/signin
   Body (JSON):
   {
     "email": "admin@marketplace.com",
     "password": "admin123"
   }
   ```

2. **Response se Token Copy karo**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

3. **Protected Route Test karo**
   ```
   GET http://localhost:5000/api/users/profile
   Headers:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### cURL se Test karna

```bash
# Login
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketplace.com","password":"admin123"}'

# Protected route (token use karo)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 9️⃣ COMMON ERRORS AUR SOLUTIONS

### Error 1: "Authentication required"
```
Reason: Token header mein nahi bheja
Solution: Authorization header add karo
```

### Error 2: "Token expired"
```
Reason: Token ki expiry time khatam ho gayi
Solution: User ko phir se login karwao
```

### Error 3: "Invalid token"
```
Reason: Token corrupt hai ya JWT_SECRET galat hai
Solution: Correct token bhejo ya JWT_SECRET check karo
```

### Error 4: "JsonWebTokenError"
```
Reason: Token format galat hai
Solution: "Bearer " prefix check karo
```

---

## 🎯 SUMMARY

1. **Token Generation**: Login/Signup par `jwt.sign()` se token banao
2. **Token Storage**: Frontend mein localStorage mein save karo
3. **Token Sending**: Har request mein `Authorization: Bearer <token>` header mein bhejo
4. **Token Verification**: Middleware mein `jwt.verify()` se check karo
5. **Token Expiry**: `expiresIn` option se expiry set karo
6. **Error Handling**: Expired/Invalid tokens ko properly handle karo

---

## 📚 CURRENT PROJECT MEIN JWT

Aapke project mein JWT already implement hai:

- ✅ Token generation: `routes/auth.js` (line 82, 142)
- ✅ Token verification: `middleware/auth.js` (line 6-30)
- ✅ Expiry: 7 days
- ✅ Protected routes: All routes with `auth` middleware

Test karne ke liye:
```bash
cd backend
node test-user-profile.js
```
