# Security Architecture Diagram

## Complete Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                           │
│                    (Browser / Mobile App)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 1: HELMET                             │
│                   Security HTTP Headers                          │
├─────────────────────────────────────────────────────────────────┤
│  Sets Headers:                                                   │
│  • X-Frame-Options: DENY (Prevent Clickjacking)                │
│  • X-Content-Type-Options: nosniff (Prevent MIME Sniffing)     │
│  • Strict-Transport-Security (Force HTTPS)                      │
│  • X-XSS-Protection: 1; mode=block                             │
│  • Content-Security-Policy (Prevent XSS)                        │
│  • Referrer-Policy: no-referrer                                 │
│  • Hide X-Powered-By header                                     │
│                                                                  │
│  ✅ Protects Against:                                           │
│     XSS, Clickjacking, MIME Sniffing, Protocol Downgrade       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 2: CORS                               │
│              Cross-Origin Resource Sharing                       │
├─────────────────────────────────────────────────────────────────┤
│  Development:                                                    │
│  • Allow all origins                                            │
│                                                                  │
│  Production:                                                     │
│  • Whitelist specific domains only                             │
│  • Check origin against allowed list                            │
│  • Reject unauthorized origins                                  │
│                                                                  │
│  Settings:                                                       │
│  • Credentials: Enabled                                         │
│  • Methods: GET, POST, PUT, DELETE, PATCH                      │
│  • Headers: Content-Type, Authorization                         │
│                                                                  │
│  ✅ Protects Against:                                           │
│     CSRF, Unauthorized Cross-Origin Requests, Data Theft       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 3: BODY PARSER                           │
│                  Parse & Limit Request Body                      │
├─────────────────────────────────────────────────────────────────┤
│  JSON Parser:                                                    │
│  • Parse JSON bodies                                            │
│  • Limit: 10kb maximum                                          │
│                                                                  │
│  URL Encoded Parser:                                             │
│  • Parse form data                                              │
│  • Limit: 10kb maximum                                          │
│                                                                  │
│  ✅ Protects Against:                                           │
│     DoS via Large Payloads, Memory Exhaustion                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 4: XSS CLEAN                             │
│              Cross-Site Scripting Sanitization                   │
├─────────────────────────────────────────────────────────────────┤
│  Sanitizes:                                                      │
│  • <script> tags                                                │
│  • javascript: protocol                                          │
│  • Event handlers (onclick, onerror, etc.)                      │
│  • Malicious HTML attributes                                    │
│  • Dangerous characters                                          │
│                                                                  │
│  Example:                                                        │
│  Input:  "<script>alert('XSS')</script>John"                   │
│  Output: "John"                                                  │
│                                                                  │
│  ✅ Protects Against:                                           │
│     Stored XSS, Reflected XSS, DOM-based XSS                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 5: HPP                                │
│          HTTP Parameter Pollution Prevention                     │
├─────────────────────────────────────────────────────────────────┤
│  Prevents:                                                       │
│  • Duplicate query parameters                                   │
│  • Parameter pollution attacks                                  │
│                                                                  │
│  Example:                                                        │
│  Before: /api/products?price=100&price=1                       │
│  After:  /api/products?price=1                                 │
│                                                                  │
│  Whitelist (Allowed Arrays):                                    │
│  • category, condition, tags, sort, fields                      │
│                                                                  │
│  ✅ Protects Against:                                           │
│     Parameter Pollution, Query Manipulation, Logic Bypass      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 6: RATE LIMITER                          │
│                  Request Rate Limiting                           │
├─────────────────────────────────────────────────────────────────┤
│  Auth Routes (/api/auth/*):                                     │
│  • 5 requests per minute                                        │
│  • Stricter to prevent brute force                             │
│                                                                  │
│  API Routes (/api/*):                                           │
│  • 100 requests per minute                                      │
│  • Standard rate for normal usage                              │
│                                                                  │
│  Strict Operations:                                              │
│  • 3 requests per 15 minutes                                    │
│  • For password reset, account deletion                         │
│                                                                  │
│  Response Headers:                                               │
│  • RateLimit-Limit: 100                                         │
│  • RateLimit-Remaining: 95                                      │
│  • RateLimit-Reset: 1640000000                                  │
│                                                                  │
│  ✅ Protects Against:                                           │
│     Brute Force, DDoS, API Abuse, Credential Stuffing          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION ROUTES                          │
│                    (Your API Endpoints)                          │
├─────────────────────────────────────────────────────────────────┤
│  /api/auth     → Authentication (5 req/min)                     │
│  /api/users    → User management (100 req/min)                  │
│  /api/products → Product operations (100 req/min)               │
│  /api/orders   → Order management (100 req/min)                 │
│  /api/swaps    → Swap operations (100 req/min)                  │
│  /api/donations→ Donation management (100 req/min)              │
│  /api/admin    → Admin operations (100 req/min)                 │
│  /api/messages → Messaging (100 req/min)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ADDITIONAL SECURITY LAYERS                     │
│                    (Already Implemented)                         │
├─────────────────────────────────────────────────────────────────┤
│  JWT Authentication:                                             │
│  • Token-based auth                                             │
│  • 7 day expiration                                             │
│  • Verified on each request                                     │
│                                                                  │
│  Password Security:                                              │
│  • Bcrypt hashing (10 rounds)                                   │
│  • No plain text storage                                        │
│  • Salted hashes                                                │
│                                                                  │
│  SQL Injection Prevention:                                       │
│  • Sequelize ORM                                                │
│  • Parameterized queries                                        │
│  • No raw SQL from user input                                   │
│                                                                  │
│  Input Validation:                                               │
│  • Joi validation schemas                                       │
│  • Type checking                                                │
│  • Length limits                                                │
│  • Format validation                                            │
│                                                                  │
│  Error Handling:                                                 │
│  • No sensitive info in errors                                  │
│  • Different messages for dev/prod                              │
│  • Stack traces only in development                             │
└─────────────────────────────────────────────────────────────────┘
```

## Security Middleware Order (Critical!)

```
1. Helmet        → Must be first to set headers
2. CORS          → Before body parsing
3. Body Parser   → Parse request body
4. XSS Clean     → After body parsing
5. HPP           → After body parsing
6. Rate Limiter  → Before routes
7. Routes        → Your application logic
8. Error Handler → Must be last
```

## Request Flow Example

### Successful Request

```
1. CLIENT
   POST /api/auth/signin
   Body: { email, password }
   
   ↓

2. HELMET
   ✅ Sets security headers
   
   ↓

3. CORS
   ✅ Origin allowed
   
   ↓

4. BODY PARSER
   ✅ Body size < 10kb
   ✅ Parsed JSON
   
   ↓

5. XSS CLEAN
   ✅ No malicious scripts
   
   ↓

6. HPP
   ✅ No duplicate parameters
   
   ↓

7. RATE LIMITER
   ✅ Under rate limit (3/5 requests)
   
   ↓

8. ROUTE HANDLER
   ✅ Process login
   
   ↓

9. RESPONSE
   200 OK + Security Headers
```

### Blocked Request (Rate Limit)

```
1. CLIENT
   POST /api/auth/signin (6th request in 1 minute)
   
   ↓

2-6. SECURITY LAYERS
   ✅ All pass
   
   ↓

7. RATE LIMITER
   ❌ BLOCKED - Exceeded 5 req/min
   
   ↓

8. RESPONSE
   429 Too Many Requests
   {
     "success": false,
     "status": "error",
     "message": "Too many authentication attempts..."
   }
```

### Blocked Request (XSS)

```
1. CLIENT
   POST /api/auth/signup
   Body: { 
     name: "<script>alert('XSS')</script>John"
   }
   
   ↓

2-3. HELMET, CORS
   ✅ Pass
   
   ↓

4. BODY PARSER
   ✅ Parsed
   
   ↓

5. XSS CLEAN
   ✅ Sanitized: name = "John"
   
   ↓

6-8. HPP, RATE LIMITER, ROUTE
   ✅ Continue with sanitized data
```

## Security Headers Response

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'self'; ...
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "success": true,
  "data": { ... }
}
```

## Vulnerabilities Prevented

```
┌─────────────────────────────────────────────────────────────┐
│                    ATTACK VECTORS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  XSS Attack                                                  │
│  ├─ Helmet CSP ✅                                           │
│  └─ XSS Clean ✅                                            │
│                                                              │
│  SQL Injection                                               │
│  └─ Sequelize ORM ✅                                        │
│                                                              │
│  CSRF Attack                                                 │
│  ├─ CORS ✅                                                 │
│  └─ SameSite Cookies ✅                                     │
│                                                              │
│  Clickjacking                                                │
│  └─ X-Frame-Options ✅                                      │
│                                                              │
│  MIME Sniffing                                               │
│  └─ X-Content-Type-Options ✅                               │
│                                                              │
│  Brute Force                                                 │
│  └─ Rate Limiting ✅                                        │
│                                                              │
│  DDoS Attack                                                 │
│  ├─ Rate Limiting ✅                                        │
│  └─ Body Size Limit ✅                                      │
│                                                              │
│  Parameter Pollution                                         │
│  └─ HPP ✅                                                  │
│                                                              │
│  Protocol Downgrade                                          │
│  └─ HSTS ✅                                                 │
│                                                              │
│  Information Leakage                                         │
│  ├─ Hide Powered-By ✅                                      │
│  └─ Error Handling ✅                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Files

```
backend/
├── config/
│   └── security.js          ← All security settings
├── server.js                ← Middleware registration
└── middleware/
    └── errorHandler.js      ← Error handling
```

## Rate Limit Tracking

```
Request 1: RateLimit-Remaining: 99
Request 2: RateLimit-Remaining: 98
Request 3: RateLimit-Remaining: 97
...
Request 100: RateLimit-Remaining: 0
Request 101: 429 Too Many Requests ❌
```

## Production Checklist

```
┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION SECURITY                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [ ] Update CORS whitelist with production domains          │
│  [ ] Set NODE_ENV=production                                │
│  [ ] Use strong JWT secret (32+ characters)                 │
│  [ ] Enable HTTPS (Let's Encrypt)                           │
│  [ ] Configure firewall                                      │
│  [ ] Set up monitoring                                       │
│  [ ] Regular security updates                                │
│  [ ] Security audit                                          │
│  [ ] Backup strategy                                         │
│  [ ] Incident response plan                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
