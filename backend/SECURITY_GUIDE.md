# Backend Security Guide

## Overview

Enterprise-grade security implementation with multiple layers of protection against common web vulnerabilities.

## Security Layers

```
Request → Helmet → CORS → Rate Limit → Body Parser → XSS Clean → HPP → Routes
```

## 1. Helmet - Security Headers

### What it Does
Sets secure HTTP headers to protect against common attacks.

### Headers Set

| Header | Purpose | Value |
|--------|---------|-------|
| Content-Security-Policy | Prevents XSS, injection attacks | Strict CSP rules |
| X-DNS-Prefetch-Control | Controls DNS prefetching | off |
| X-Frame-Options | Prevents clickjacking | DENY |
| X-Content-Type-Options | Prevents MIME sniffing | nosniff |
| Strict-Transport-Security | Forces HTTPS | max-age=31536000 |
| X-XSS-Protection | Enables XSS filter | 1; mode=block |
| Referrer-Policy | Controls referrer info | no-referrer |

### Configuration

```javascript
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
};
```

### Protection Against
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME sniffing
- Protocol downgrade attacks
- Information leakage

## 2. Rate Limiting

### What it Does
Limits the number of requests from a single IP to prevent abuse.

### Configurations

#### Auth Routes (Strict)
```javascript
// 5 requests per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many authentication attempts. Please try again after 1 minute.'
});
```

**Applied to:**
- `/api/auth/signin`
- `/api/auth/signup`
- `/api/auth/refresh`

#### API Routes (Standard)
```javascript
// 100 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests. Please try again after 1 minute.'
});
```

**Applied to:**
- All `/api/*` routes

#### Strict Limiter (Very Strict)
```javascript
// 3 requests per 15 minutes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Too many attempts. Please try again after 15 minutes.'
});
```

**Use for:**
- Password reset
- Account deletion
- Email verification resend

### Response Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

### Error Response

```json
{
  "success": false,
  "status": "error",
  "message": "Too many requests. Please try again after 1 minute."
}
```

### Protection Against
- Brute force attacks
- DDoS attacks
- API abuse
- Credential stuffing

## 3. CORS (Cross-Origin Resource Sharing)

### What it Does
Controls which domains can access your API.

### Configuration

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
      // Add production domains
    ];
    
    // Development: allow all
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Production: check whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining'],
  maxAge: 600
};
```

### Allowed Origins

**Development:**
- `http://localhost:3000` (React)
- `http://localhost:5173` (Vite)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

**Production:**
Add your production domains to the whitelist.

### Protection Against
- Unauthorized cross-origin requests
- CSRF attacks
- Data theft

## 4. XSS Clean

### What it Does
Sanitizes user input to remove malicious scripts.

### How it Works

**Before:**
```javascript
{
  "name": "<script>alert('XSS')</script>John"
}
```

**After:**
```javascript
{
  "name": "John"
}
```

### What it Removes
- `<script>` tags
- `javascript:` protocol
- `onerror` attributes
- `onclick` attributes
- Other XSS vectors

### Protection Against
- Stored XSS
- Reflected XSS
- DOM-based XSS

## 5. HPP (HTTP Parameter Pollution)

### What it Does
Prevents parameter pollution attacks by removing duplicate parameters.

### Configuration

```javascript
const hppConfig = {
  whitelist: [
    'category',    // Allow multiple categories
    'condition',   // Allow multiple conditions
    'tags',        // Allow multiple tags
    'sort',        // Allow multiple sort fields
    'fields'       // Allow multiple field selections
  ]
};
```

### Example Attack Prevention

**Malicious Request:**
```
GET /api/products?price=100&price=1
```

**After HPP:**
```
GET /api/products?price=1
```

**Whitelisted (Allowed):**
```
GET /api/products?category=electronics&category=books
```

### Protection Against
- Parameter pollution
- Query manipulation
- Logic bypass

## 6. Body Size Limiting

### What it Does
Limits request body size to prevent DoS attacks.

### Configuration

```javascript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

### Protection Against
- DoS attacks via large payloads
- Memory exhaustion
- Server overload

## Security Best Practices

### 1. Environment Variables

```env
# Never commit these to git
JWT_SECRET=your_very_long_random_secret_key_here
DB_PASSWORD=your_database_password

# Use strong secrets
# Minimum 32 characters
# Mix of letters, numbers, symbols
```

### 2. Password Security

```javascript
// Already implemented
- Bcrypt hashing (10 rounds)
- No plain text storage
- Rate limiting on auth routes
```

### 3. JWT Security

```javascript
// Already implemented
- 7 day expiration
- Signed with secret
- Verified on each request
- Stored in Authorization header
```

### 4. Database Security

```javascript
// Already implemented
- Sequelize ORM (prevents SQL injection)
- Parameterized queries
- Input validation
- Connection pooling
```

### 5. Error Handling

```javascript
// Already implemented
- No sensitive info in errors
- Different messages for dev/prod
- Stack traces only in development
```

## Testing Security

### Test 1: Rate Limiting

```bash
# Test auth rate limit (should block after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
  echo ""
done
```

Expected: First 5 succeed, rest get rate limit error.

### Test 2: XSS Protection

```bash
# Try to inject script
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"test123",
    "full_name":"<script>alert(\"XSS\")</script>John",
    "role":"buyer"
  }'
```

Expected: Script tags removed from name.

### Test 3: CORS

```bash
# Request from unauthorized origin
curl -X GET http://localhost:5000/api/products \
  -H "Origin: http://evil.com"
```

Expected: CORS error in production.

### Test 4: Large Payload

```bash
# Try to send large payload (>10kb)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"title":"'$(python -c "print('A'*20000)")'"}'
```

Expected: 413 Payload Too Large error.

### Test 5: Security Headers

```bash
# Check security headers
curl -I http://localhost:5000/api
```

Expected headers:
```
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-XSS-Protection: 1; mode=block
```

## Security Checklist

### Application Level
- [x] Helmet security headers
- [x] Rate limiting (auth + API)
- [x] CORS configuration
- [x] XSS sanitization
- [x] HPP protection
- [x] Body size limiting
- [x] JWT authentication
- [x] Password hashing
- [x] Input validation
- [x] Error handling

### Database Level
- [x] ORM (SQL injection prevention)
- [x] Parameterized queries
- [x] Connection pooling
- [x] Environment variables

### Code Level
- [x] No sensitive data in code
- [x] Environment variables for secrets
- [x] Secure error messages
- [x] Input sanitization

### Deployment Level
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Production CORS whitelist
- [ ] Firewall configured
- [ ] Regular updates
- [ ] Security monitoring

## Common Vulnerabilities Prevented

| Vulnerability | Prevention Method |
|---------------|-------------------|
| XSS | Helmet CSP + xss-clean |
| SQL Injection | Sequelize ORM |
| CSRF | CORS + SameSite cookies |
| Clickjacking | X-Frame-Options |
| MIME Sniffing | X-Content-Type-Options |
| Brute Force | Rate limiting |
| DDoS | Rate limiting + body size limit |
| Parameter Pollution | HPP |
| Protocol Downgrade | HSTS |
| Information Leakage | Error handling + hidePoweredBy |

## Monitoring & Logging

### What to Monitor

1. **Rate Limit Hits**
   - Track IPs hitting rate limits
   - Identify potential attackers

2. **Failed Auth Attempts**
   - Monitor failed logins
   - Alert on suspicious patterns

3. **Error Rates**
   - Track 4xx and 5xx errors
   - Identify attack patterns

4. **Response Times**
   - Monitor for DoS attacks
   - Identify performance issues

### Recommended Tools

- **Winston** - Logging
- **Morgan** - HTTP request logging
- **PM2** - Process monitoring
- **New Relic** - APM
- **Sentry** - Error tracking

## Production Deployment

### Before Deployment

1. **Update CORS whitelist**
   ```javascript
   const allowedOrigins = [
     'https://yourdomain.com',
     'https://www.yourdomain.com'
   ];
   ```

2. **Set NODE_ENV=production**
   ```env
   NODE_ENV=production
   ```

3. **Use strong JWT secret**
   ```env
   JWT_SECRET=your_very_long_random_secret_minimum_32_characters
   ```

4. **Enable HTTPS**
   - Use Let's Encrypt
   - Configure SSL/TLS

5. **Set up firewall**
   - Allow only necessary ports
   - Block suspicious IPs

### After Deployment

1. Test all security measures
2. Monitor logs
3. Set up alerts
4. Regular security audits
5. Keep dependencies updated

## Updating Security Configuration

### Add New Allowed Origin

```javascript
// config/security.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://yournewdomain.com' // Add here
];
```

### Adjust Rate Limits

```javascript
// config/security.js
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // Increase from 5 to 10
  // ...
});
```

### Add HPP Whitelist Parameter

```javascript
// config/security.js
const hppConfig = {
  whitelist: [
    'category',
    'condition',
    'newparam' // Add here
  ]
};
```

## Support

For security issues:
1. Check this guide
2. Review config/security.js
3. Test with provided scripts
4. Monitor application logs
