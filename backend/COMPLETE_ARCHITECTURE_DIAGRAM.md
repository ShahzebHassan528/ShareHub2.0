# Complete Backend Architecture

## Full System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│                    React / Browser / Mobile                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request (JSON + JWT)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│                    (server.js - Port 5000)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   CORS       │  │  Body Parser │  │  Auth Check  │         │
│  │  (headers)   │  │   (JSON)     │  │  (JWT verify)│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTES (Controllers)                          │
│                    Wrapped with catchAsync                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  /auth   │ │ /users   │ │/products │ │ /orders  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐          │
│  │ /swaps   │ │/donations│ │/messages │ │ /admin   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  Responsibilities:                                               │
│  • Extract request data                                          │
│  • Call service methods                                          │
│  • Format HTTP responses                                         │
│  • NO try-catch (handled by catchAsync)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│                    Business Logic Layer                          │
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
│  • Throw AppError for operational errors                        │
│  • Cross-model operations                                        │
│  • Notification triggers                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODEL WRAPPERS                                │
│                    Data Access Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ User.wrapper │  │Product.wrap  │  │ Order.wrapper│         │
│  │              │  │              │  │              │         │
│  │ • create()   │  │ • findAll()  │  │ • findById() │         │
│  │ • findById() │  │ • findNearby │  │ • addItem()  │         │
│  │ • update()   │  │ • update()   │  │ • update()   │         │
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
│                   SEQUELIZE MODELS                               │
│                    ORM Definition Layer                          │
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
│                   Query Builder & Executor                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE                              │
│                   (marketplace_db @ XAMPP)                       │
└─────────────────────────────────────────────────────────────────┘

                             ▲
                             │
                             │ If Error Occurs
                             │
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING LAYER                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  catchAsync Wrapper                                       │  │
│  │  • Wraps all async route handlers                        │  │
│  │  • Catches errors automatically                          │  │
│  │  • Passes to global error handler                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Global Error Handler                                     │  │
│  │  • Handles Sequelize errors                              │  │
│  │  • Handles JWT errors                                     │  │
│  │  • Handles AppError instances                            │  │
│  │  • Formats error responses                               │  │
│  │  • Different output for dev/prod                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Error Response                                           │  │
│  │  {                                                        │  │
│  │    "success": false,                                      │  │
│  │    "status": "fail",                                      │  │
│  │    "message": "User not found",                          │  │
│  │    "stack": "..." (dev only)                             │  │
│  │  }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow with Error Handling

### Success Flow

```
1. CLIENT
   POST /api/auth/signin
   Body: { email, password }
   
   ↓

2. EXPRESS SERVER
   Receives request
   
   ↓

3. MIDDLEWARE
   • CORS ✓
   • Body Parser ✓
   
   ↓

4. ROUTE (wrapped with catchAsync)
   router.post('/signin', catchAsync(async (req, res) => {
     
     ↓

5. SERVICE LAYER
     const result = await AuthService.login(email, password);
     
     • Validate credentials
     • Check account status
     • Generate JWT token
     
     ↓

6. MODEL WRAPPER
     const user = await User.findByEmail(email);
     
     ↓

7. SEQUELIZE MODEL
     SELECT * FROM users WHERE email = ?
     
     ↓

8. DATABASE
     Returns user record
     
     ↓

9. BACK TO SERVICE
     • Password verified ✓
     • Token generated ✓
     • Return { token, user }
     
     ↓

10. BACK TO ROUTE
     res.json({ success: true, ...result });
   }));
   
   ↓

11. CLIENT
    Receives: { success: true, token: "...", user: {...} }
```

### Error Flow

```
1. CLIENT
   GET /api/users/99999
   
   ↓

2. EXPRESS SERVER
   Receives request
   
   ↓

3. ROUTE (wrapped with catchAsync)
   router.get('/users/:id', catchAsync(async (req, res) => {
     
     ↓

4. SERVICE LAYER
     const user = await UserService.getUserById(99999);
     
     ↓

5. MODEL WRAPPER
     const user = await User.findById(99999);
     // Returns null
     
     ↓

6. SERVICE THROWS ERROR
     if (!user) {
       throw new AppError('User not found', 404);
     }
     
     ↓

7. catchAsync CATCHES ERROR
     fn(req, res, next).catch(next);
     // Passes error to next()
     
     ↓

8. GLOBAL ERROR HANDLER
     errorHandler(err, req, res, next) {
       // Formats error
       // Checks if operational
       // Sends appropriate response
     }
     
     ↓

9. CLIENT
    Receives: {
      success: false,
      status: "fail",
      message: "User not found"
    }
```

## Layer Responsibilities

### Routes (Controllers)
- ✅ Extract request data
- ✅ Call service methods
- ✅ Format responses
- ❌ NO business logic
- ❌ NO try-catch blocks
- ❌ NO error handling

### Services (Business Logic)
- ✅ Validate data
- ✅ Implement business rules
- ✅ Throw AppError
- ✅ Coordinate models
- ❌ NO HTTP concerns
- ❌ NO response formatting

### Model Wrappers (Data Access)
- ✅ Database operations
- ✅ Query building
- ✅ Transactions
- ❌ NO business logic
- ❌ NO validation

### Sequelize Models (ORM)
- ✅ Schema definition
- ✅ Relationships
- ✅ Field validation
- ❌ NO business logic

### Error Handler (Error Management)
- ✅ Catch all errors
- ✅ Format responses
- ✅ Handle specific error types
- ✅ Different output for dev/prod

## Technology Stack

```
┌─────────────────────────────────────────┐
│  Express.js - Web Framework             │
├─────────────────────────────────────────┤
│  Sequelize - ORM                        │
├─────────────────────────────────────────┤
│  MySQL2 - Database Driver               │
├─────────────────────────────────────────┤
│  JWT - Authentication                   │
├─────────────────────────────────────────┤
│  Bcrypt - Password Hashing              │
├─────────────────────────────────────────┤
│  CORS - Cross-Origin Resource Sharing   │
├─────────────────────────────────────────┤
│  Dotenv - Environment Variables         │
└─────────────────────────────────────────┘
```

## File Structure

```
backend/
├── server.js                    # Express app + error handlers
├── config/
│   ├── database.js              # Raw SQL connection
│   └── sequelize.js             # Sequelize connection
├── middleware/
│   ├── auth.js                  # JWT verification
│   └── errorHandler.js          # Global error handler ⭐
├── utils/
│   ├── AppError.js              # Custom error class ⭐
│   └── catchAsync.js            # Async wrapper ⭐
├── routes/                      # HTTP endpoints
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   └── ...
├── services/                    # Business logic ⭐
│   ├── auth.service.js
│   ├── user.service.js
│   ├── product.service.js
│   └── ...
├── models/                      # Data access wrappers
│   ├── User.sequelize.wrapper.js
│   ├── Product.sequelize.wrapper.js
│   └── ...
└── database/
    └── models/                  # Sequelize models
        ├── User.sequelize.js
        ├── Product.sequelize.js
        └── ...
```

## Key Features

✅ **Service Layer** - Business logic separated
✅ **Error Handling** - Centralized and consistent
✅ **ORM** - Sequelize for database operations
✅ **JWT Auth** - Token-based authentication
✅ **Validation** - Input validation in services
✅ **Transactions** - Atomic operations
✅ **Relationships** - Model associations
✅ **Middleware** - Auth, CORS, error handling
✅ **Environment Config** - Dotenv for configuration

## Benefits

1. **Separation of Concerns** - Each layer has one responsibility
2. **Maintainability** - Easy to update and debug
3. **Testability** - Each layer can be tested independently
4. **Scalability** - Easy to add new features
5. **Consistency** - Standardized patterns throughout
6. **Error Handling** - Centralized and predictable
7. **Security** - JWT auth, input validation, SQL injection prevention
8. **Performance** - Connection pooling, query optimization
