# Redis Cache Quick Reference

## Installation

```bash
# Install Redis client
npm install redis

# Start Redis server (Windows)
redis-server.exe

# Start Redis server (Linux/Mac)
redis-server
```

## Environment Variables

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Basic Usage

### Cache GET Request

```javascript
const { cacheMiddleware } = require('../middleware/cache');
const { CACHE_KEYS, CACHE_TTL } = require('../config/redis');

router.get('/products', 
  cacheMiddleware(CACHE_KEYS.PRODUCTS, CACHE_TTL.MEDIUM),
  async (req, res) => {
    // Your handler
  }
);
```

### Invalidate on Update

```javascript
const { invalidateCacheMiddleware } = require('../middleware/cache');

router.post('/products',
  invalidateCacheMiddleware(`${CACHE_KEYS.PRODUCTS}:*`),
  async (req, res) => {
    // Your handler
  }
);
```

## Cache Keys

| Key | Usage | TTL |
|-----|-------|-----|
| `products` | Product listings | 5 min |
| `product` | Product details | 5 min |
| `categories` | Category listings | 5 min |
| `dashboard` | Dashboard stats | 5 min |
| `orders` | Order data | 5 min |
| `swaps` | Swap data | 5 min |
| `donations` | Donation data | 5 min |

## TTL Values

```javascript
CACHE_TTL.SHORT = 60        // 1 minute
CACHE_TTL.MEDIUM = 300      // 5 minutes (default)
CACHE_TTL.LONG = 900        // 15 minutes
CACHE_TTL.VERY_LONG = 3600  // 1 hour
```

## Manual Invalidation

```javascript
const {
  invalidateProductCache,
  invalidateCategoryCache,
  invalidateDashboardCache
} = require('../utils/cacheManager');

await invalidateProductCache();
```

## Testing

```bash
# Test Redis connection
node backend/test-redis-cache.js

# Check Redis is running
redis-cli ping
# Should return: PONG

# View all keys
redis-cli KEYS "*"

# Clear all cache
redis-cli FLUSHDB
```

## Cached Routes

| Route | Cache Key | TTL |
|-------|-----------|-----|
| `GET /api/products` | `products:*` | 5 min |
| `GET /api/products/:id` | `product:*` | 5 min |
| `GET /api/categories` | `categories:*` | 5 min |
| `GET /api/dashboard/stats` | `dashboard:*` | 5 min |

## Cache Invalidation

| Action | Invalidates |
|--------|-------------|
| Create/Update/Delete Product | `products:*`, `product:*`, `dashboard:*` |
| Create/Update/Delete Category | `categories:*`, `products:*`, `dashboard:*` |
| Create/Update Order | `orders:*`, `dashboard:*` |
| Create/Update Donation | `donations:*`, `dashboard:*` |
| Create/Update Swap | `swaps:*`, `dashboard:*` |

## Common Commands

```bash
# Check cache hit/miss in logs
✅ Cache HIT: products:/api/products:{}:{}
⚠️  Cache MISS: products:/api/products:{}:{}

# Monitor Redis
redis-cli MONITOR

# Get cache stats
redis-cli INFO stats

# Count keys
redis-cli DBSIZE
```

## Files

- `config/redis.js` - Redis configuration
- `middleware/cache.js` - Cache middleware
- `utils/cacheManager.js` - Cache utilities
- `routes/*.js` - Routes with caching
- `test-redis-cache.js` - Test suite
- `REDIS_CACHE_GUIDE.md` - Full documentation
