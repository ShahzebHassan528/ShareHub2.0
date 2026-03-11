# Security Quick Reference

## Security Middleware Order

```javascript
1. Helmet        → Security headers
2. CORS          → Cross-origin control
3. Body Parser   → Parse JSON (10kb limit)
4. XSS Clean     → Sanitize input
5. HPP           → Prevent parameter pollution
6. Rate Limiter  → Limit requests
```

## Rate Limits

| Route | Limit | Window |
|-------|-------|--------|
| `/api/auth/*` | 5 requests | 1 minute |
| `/api/*` | 100 requests | 1 minute |
| Strict operations | 3 requests | 15 minutes |

## Security Headers

```
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
```

## CORS Configuration

**Development:** All origins allowed

**Production:** Whitelist only
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  // Add production domains
];
```

## XSS Protection

Automatically removes:
- `<script>` tags
- `javascript:` protocol
- Event handlers (`onclick`, `onerror`)
- Malicious attributes

## HPP Whitelist

Allowed array parameters:
```javascript
['category', 'condition', 'tags', 'sort', 'fields']
```

## Body Size Limit

Maximum: **10kb**

Prevents DoS attacks via large payloads.

## Testing Commands

### Test Rate Limiting
```bash
# Auth routes (5 req/min)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
done
```

### Test XSS Protection
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","full_name":"<script>alert(1)</script>John","role":"buyer"}'
```

### Check Security Headers
```bash
curl -I http://localhost:5000/api
```

### Test Large Payload
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"title":"'$(python -c "print('A'*20000)")'"}'
```

## Rate Limit Response

```json
{
  "success": false,
  "status": "error",
  "message": "Too many requests. Please try again after 1 minute."
}
```

## Rate Limit Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

## Configuration Files

- `config/security.js` - All security settings
- `server.js` - Middleware registration

## Common Tasks

### Add Allowed Origin
```javascript
// config/security.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourdomain.com' // Add here
];
```

### Adjust Rate Limit
```javascript
// config/security.js
const authLimiter = rateLimit({
  max: 10, // Change from 5 to 10
  // ...
});
```

### Add HPP Whitelist
```javascript
// config/security.js
const hppConfig = {
  whitelist: [
    'category',
    'newparam' // Add here
  ]
};
```

## Security Checklist

- [x] Helmet headers
- [x] Rate limiting
- [x] CORS configured
- [x] XSS protection
- [x] HPP protection
- [x] Body size limit
- [x] JWT auth
- [x] Password hashing
- [x] Input validation
- [x] Error handling

## Production Checklist

- [ ] Update CORS whitelist
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Regular updates

## Vulnerabilities Prevented

✅ XSS (Cross-Site Scripting)
✅ SQL Injection
✅ CSRF (Cross-Site Request Forgery)
✅ Clickjacking
✅ MIME Sniffing
✅ Brute Force
✅ DDoS
✅ Parameter Pollution
✅ Protocol Downgrade
✅ Information Leakage

## Quick Fixes

### Rate limit too strict?
```javascript
// Increase max in config/security.js
max: 10 // from 5
```

### CORS blocking requests?
```javascript
// Add origin to allowedOrigins
'https://yourdomain.com'
```

### Body too large error?
```javascript
// Increase limit in server.js
app.use(express.json({ limit: '50kb' }));
```

## Support

Check: `SECURITY_GUIDE.md` for detailed documentation
