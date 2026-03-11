/**
 * Cache Middleware
 * Production-safe Redis caching for GET requests only
 */

const { getRedisClient, isRedisAvailable, getDefaultTTL } = require('../config/redis');

/**
 * Generate cache key from request
 * Format: <route>:<full_url>
 * @param {Object} req - Express request object
 * @returns {string} Cache key
 */
function generateCacheKey(req) {
  const route = req.route ? req.route.path : req.path;
  const fullUrl = req.originalUrl || req.url;
  return `${route}:${fullUrl}`;
}

/**
 * Cache middleware for GET requests
 * @param {number} ttl - Time to live in seconds (optional, defaults to REDIS_TTL from env)
 * @returns {Function} Express middleware
 */
function cacheMiddleware(ttl) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis not available
    if (!isRedisAvailable()) {
      return next();
    }

    const redisClient = getRedisClient();
    const cacheKey = generateCacheKey(req);
    const cacheTTL = ttl || getDefaultTTL();

    try {
      // Try to get cached data
      redisClient.get(cacheKey, (err, cachedData) => {
        if (err) {
          // On error, continue without cache
          return next();
        }

        if (cachedData) {
          // Cache HIT
          console.log(`⚡ Redis Cache HIT: ${cacheKey}`);
          const data = JSON.parse(cachedData);
          return res.json(data);
        }

        // Cache MISS
        console.log(`📦 Redis Cache MISS: ${cacheKey}`);

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = function(data) {
          // Only cache successful responses (status 200)
          if (res.statusCode === 200) {
            redisClient.setex(cacheKey, cacheTTL, JSON.stringify(data), (err) => {
              if (err) {
                console.error('❌ Redis cache set error:', err.message);
              }
            });
          }

          // Call original json method
          return originalJson(data);
        };

        next();
      });
    } catch (error) {
      // On any error, continue without cache
      console.error('❌ Cache middleware error:', error.message);
      next();
    }
  };
}

/**
 * Invalidate cache by pattern
 * Automatically called on POST/PUT/DELETE requests
 * @param {string} pattern - Cache key pattern (e.g., '/api/products*')
 * @returns {Promise<number>} Number of keys deleted
 */
async function invalidateCache(pattern) {
  if (!isRedisAvailable()) {
    return 0;
  }

  const redisClient = getRedisClient();

  return new Promise((resolve, reject) => {
    // Convert route pattern to Redis pattern
    const redisPattern = `*${pattern}*`;

    redisClient.keys(redisPattern, (err, keys) => {
      if (err) {
        console.error('❌ Redis keys error:', err.message);
        return reject(err);
      }

      if (keys.length === 0) {
        return resolve(0);
      }

      redisClient.del(keys, (err, count) => {
        if (err) {
          console.error('❌ Redis del error:', err.message);
          return reject(err);
        }

        console.log(`🗑️  Invalidated ${count} cache keys for pattern: ${pattern}`);
        resolve(count);
      });
    });
  });
}

/**
 * Middleware to auto-invalidate cache on POST/PUT/DELETE
 * @param {string|Array<string>} patterns - Route patterns to invalidate
 * @returns {Function} Express middleware
 */
function autoInvalidateCache(patterns) {
  return async (req, res, next) => {
    // Only invalidate on modification methods
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate after response
    res.json = async function(data) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

        for (const pattern of patternsArray) {
          try {
            await invalidateCache(pattern);
          } catch (error) {
            // Log but don't fail the request
            console.error('❌ Cache invalidation error:', error.message);
          }
        }
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  autoInvalidateCache,
  generateCacheKey
};
