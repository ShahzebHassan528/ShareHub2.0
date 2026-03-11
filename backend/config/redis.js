/**
 * Redis Configuration
 * Production-safe Redis client setup with graceful fallback
 */

const redis = require('redis');

// Redis client instance
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 * @returns {Promise<Object|null>} Redis client or null if unavailable
 */
async function initRedis() {
  // Check if already initialized
  if (redisClient) {
    return redisClient;
  }

  try {
    // Read config from environment
    const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
    const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;

    // Create Redis client
    redisClient = redis.createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
      retry_strategy: (options) => {
        // Stop retrying after 3 attempts
        if (options.attempt > 3) {
          console.log('⚠️  Redis Disabled - Fallback Mode');
          return undefined; // Stop retrying
        }
        // Retry after 1 second
        return 1000;
      }
    });

    // Event handlers
    redisClient.on('connect', () => {
      console.log('🔷 Redis connecting...');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      console.log('✅ Redis Connected');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      // Only log first error, then go silent
      if (err.code === 'ECONNREFUSED') {
        console.log('⚠️  Redis Disabled - Fallback Mode');
      }
    });

    redisClient.on('end', () => {
      isConnected = false;
    });

    // Wait for connection (with timeout)
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⚠️  Redis Disabled - Fallback Mode');
        resolve(null);
      }, 2000); // 2 second timeout

      redisClient.on('ready', () => {
        clearTimeout(timeout);
        resolve(redisClient);
      });

      redisClient.on('error', () => {
        clearTimeout(timeout);
        resolve(null);
      });
    });

    return isConnected ? redisClient : null;
  } catch (error) {
    console.log('⚠️  Redis Disabled - Fallback Mode');
    redisClient = null;
    isConnected = false;
    return null;
  }
}

/**
 * Get Redis client instance
 * @returns {Object|null} Redis client or null
 */
function getRedisClient() {
  return isConnected ? redisClient : null;
}

/**
 * Check if Redis is available
 * @returns {boolean} True if Redis is connected
 */
function isRedisAvailable() {
  return isConnected && redisClient !== null;
}

/**
 * Close Redis connection gracefully
 * @returns {Promise<void>}
 */
async function closeRedis() {
  if (redisClient && isConnected) {
    await new Promise((resolve) => {
      redisClient.quit(() => {
        isConnected = false;
        redisClient = null;
        resolve();
      });
    });
  }
}

/**
 * Get default TTL from environment
 * @returns {number} TTL in seconds
 */
function getDefaultTTL() {
  return parseInt(process.env.REDIS_TTL) || 300;
}

module.exports = {
  initRedis,
  getRedisClient,
  isRedisAvailable,
  closeRedis,
  getDefaultTTL
};
