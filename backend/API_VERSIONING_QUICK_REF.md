# API Versioning - Quick Reference

## URLs

### v1 (Recommended)
```
http://localhost:5000/api/v1/*
```

### Legacy (Backward Compatible)
```
http://localhost:5000/api/*
```

## Endpoints

| Resource | v1 | Legacy |
|----------|-----|--------|
| API Info | `/api/v1` | `/api` |
| Auth | `/api/v1/auth/*` | `/api/auth/*` |
| Products | `/api/v1/products/*` | `/api/products/*` |
| Swaps | `/api/v1/swaps/*` | `/api/swaps/*` |
| Messages | `/api/v1/messages/*` | `/api/messages/*` |
| Admin | `/api/v1/admin/*` | `/api/admin/*` |
| Notifications | `/api/v1/notifications/*` | `/api/notifications/*` |
| Users | `/api/v1/users/*` | `/api/users/*` |
| Categories | `/api/v1/categories/*` | `/api/categories/*` |
| Dashboard | `/api/v1/dashboard/*` | `/api/dashboard/*` |

## Quick Examples

### Login (v1)
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Get Products (v1)
```bash
curl http://localhost:5000/api/v1/products
```

### Create Product (v1)
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Product","price":99.99}'
```

## Frontend Migration

### Before
```javascript
const API_BASE = 'http://localhost:5000/api';
```

### After
```javascript
const API_BASE = 'http://localhost:5000/api/v1';
```

## File Structure

```
backend/routes/
├── v1/
│   ├── index.js          # v1 route registration
│   ├── auth.js
│   ├── products.js
│   ├── swaps.js
│   ├── messages.js
│   ├── admin.js
│   ├── notifications.js
│   ├── users.js
│   ├── categories.js
│   └── dashboard.js
│
├── legacy.js             # Legacy route registration
│
└── [original files]      # Shared by both v1 and legacy
```

## Testing

```bash
# Test v1
curl http://localhost:5000/api/v1

# Test legacy
curl http://localhost:5000/api

# Both should work!
```

## Status

- ✅ v1 routes: Active
- ✅ Legacy routes: Backward compatible
- ✅ No breaking changes
- ✅ Production ready

## Recommendation

**Use `/api/v1/*` for all new development**
