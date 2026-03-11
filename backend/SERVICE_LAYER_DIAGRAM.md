# Service Layer Architecture Diagram

## Complete Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│                    React / Browser / Mobile                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request
                             │ (JSON + JWT Token)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│                    (server.js - Port 5000)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   CORS       │  │  Body Parser │  │  Auth Check  │         │
│  │  (headers)   │  │   (JSON)     │  │  (JWT verify)│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          ROUTES                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  /auth   │ │ /users   │ │/products │ │ /orders  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐          │
│  │ /swaps   │ │/donations│ │/messages │ │ /admin   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  Responsibilities:                                               │
│  • Extract request data (body, params, query, headers)          │
│  • Call service methods                                          │
│  • Format HTTP responses                                         │
│  • Handle HTTP status codes                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (NEW!)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AuthService  │  │ UserService  │  │ProductService│         │
│  │              │  │              │  │              │         │
│  │ • register() │  │ • getProfile │  │ • getAllProd │         │
│  │ • login()    │  │ • updateProf │  │ • findNearby │         │
│  │ • genToken() │  │ • suspend()  │  │ • blockProd  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ OrderService │  │DonationServ  │  │ SwapService  │         │
│  │              │  │              │  │              │         │
│  │ • createOrd  │  │ • createDon  │  │ • createSwap │         │
│  │ • updateStat │  │ • acceptDon  │  │ • acceptSwap │         │
│  │ • getStats   │  │ • rejectDon  │  │ • completeS  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Responsibilities:                                               │
│  • Business logic and rules                                      │
│  • Data validation                                               │
│  • Cross-model operations                                        │
│  • Error handling (throw errors)                                 │
│  • Notification triggers                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODEL WRAPPERS (Existing)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ User.wrapper │  │Product.wrap  │  │ Order.wrapper│         │
│  │              │  │              │  │              │         │
│  │ • create()   │  │ • findAll()  │  │ • findById() │         │
│  │ • findById() │  │ • findNearby │  │ • addItem()  │         │
│  │ • update()   │  │ • update()   │  │ • update()   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Donation.wrap │  │ Swap.wrapper │  │ NGO.wrapper  │         │
│  │              │  │              │  │              │         │
│  │ • findByNGO  │  │ • accept()   │  │ • findById() │         │
│  │ • update()   │  │ • reject()   │  │ • update()   │         │
│  │ • create()   │  │ • complete() │  │ • create()   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Responsibilities:                                               │
│  • Database operations (CRUD)                                    │
│  • Query building                                                │
│  • Transaction handling                                          │
│  • Data transformation                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SEQUELIZE MODELS (Existing)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ User.model   │  │Product.model │  │ Order.model  │         │
│  │              │  │              │  │              │         │
│  │ • Schema     │  │ • Schema     │  │ • Schema     │         │
│  │ • Relations  │  │ • Relations  │  │ • Relations  │         │
│  │ • Validation │  │ • Validation │  │ • Validation │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Responsibilities:                                               │
│  • Table structure definition                                    │
│  • Relationships (associations)                                  │
│  • Field validation rules                                        │
│  • Hooks (beforeCreate, afterUpdate)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SEQUELIZE ORM                               │
│                   (Query Builder & Executor)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE                              │
│                   (marketplace_db @ XAMPP)                       │
│                                                                  │
│  Tables: users, sellers, ngos, products, orders, donations,     │
│          swaps, notifications, messages, admin_logs, etc.       │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Example: User Login

```
1. CLIENT
   POST /api/auth/signin
   Body: { email: "user@example.com", password: "pass123" }
   
   ↓

2. EXPRESS SERVER
   Receives request on port 5000
   
   ↓

3. MIDDLEWARE
   • CORS: Allow origin
   • Body Parser: Parse JSON body
   
   ↓

4. ROUTE (routes/auth.js)
   router.post('/signin', async (req, res) => {
     const { email, password } = req.body;
     
     ↓

5. SERVICE LAYER (services/auth.service.js)
     const result = await AuthService.login(email, password);
     
     • Find user by email
     • Verify password with bcrypt
     • Check account status
     • Generate JWT token
     
     ↓

6. MODEL WRAPPER (models/User.sequelize.wrapper.js)
     const user = await User.findByEmail(email);
     
     ↓

7. SEQUELIZE MODEL (database/models/User.sequelize.js)
     SELECT * FROM users WHERE email = ?
     
     ↓

8. MYSQL DATABASE
     Returns user record
     
     ↓

9. BACK TO SERVICE
     • Password verified ✓
     • Token generated ✓
     • Return { token, user }
     
     ↓

10. BACK TO ROUTE
     res.json(result);
   });
   
   ↓

11. CLIENT
    Receives: { 
      message: "Login successful",
      token: "eyJhbGc...",
      user: { id: 1, email: "...", role: "buyer" }
    }
```

## Before vs After Service Layer

### BEFORE (Business Logic in Routes)

```
Route
├── Extract request data
├── Validate data ❌ (mixed with route)
├── Check user exists ❌ (business logic in route)
├── Hash password ❌ (business logic in route)
├── Create user ❌ (business logic in route)
├── Generate token ❌ (business logic in route)
└── Send response
```

### AFTER (Business Logic in Services)

```
Route
├── Extract request data
├── Call AuthService.register() ✓
└── Send response

AuthService
├── Validate data ✓ (in service)
├── Check user exists ✓ (business logic)
├── Hash password ✓ (business logic)
├── Create user ✓ (business logic)
└── Generate token ✓ (business logic)
```

## Benefits Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    WITHOUT SERVICE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Route 1 ──┐                                                │
│            ├──> Business Logic (duplicated)                 │
│  Route 2 ──┤                                                │
│            ├──> Validation (duplicated)                     │
│  Route 3 ──┘                                                │
│                                                              │
│  ❌ Code duplication                                        │
│  ❌ Hard to test                                            │
│  ❌ Mixed concerns                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     WITH SERVICE LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Route 1 ──┐                                                │
│            │                                                 │
│  Route 2 ──┼──> Service ──> Business Logic (centralized)   │
│            │                                                 │
│  Route 3 ──┘                                                │
│                                                              │
│  ✅ Code reusability                                        │
│  ✅ Easy to test                                            │
│  ✅ Separation of concerns                                  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
backend/
├── server.js                    # Express app setup
├── routes/                      # HTTP endpoints
│   ├── auth.js                  # Original (working)
│   ├── auth.refactored.js       # New with services
│   ├── users.js                 # Original (working)
│   ├── users.refactored.js      # New with services
│   ├── products.js
│   ├── orders.js
│   ├── donations.js
│   ├── swaps.js
│   └── admin.js
├── services/                    # ⭐ NEW LAYER
│   ├── index.js                 # Central export
│   ├── auth.service.js          # Auth business logic
│   ├── user.service.js          # User business logic
│   ├── product.service.js       # Product business logic
│   ├── order.service.js         # Order business logic
│   ├── donation.service.js      # Donation business logic
│   ├── swap.service.js          # Swap business logic
│   └── notificationService.js   # Notification logic
├── models/                      # Database wrappers
│   ├── User.sequelize.wrapper.js
│   ├── Product.sequelize.wrapper.js
│   └── ...
├── database/
│   └── models/                  # Sequelize models
│       ├── User.sequelize.js
│       ├── Product.sequelize.js
│       └── ...
├── middleware/
│   └── auth.js                  # JWT verification
└── config/
    └── sequelize.js             # Database connection
```
