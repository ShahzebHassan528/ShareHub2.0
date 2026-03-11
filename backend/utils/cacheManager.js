/**
 * Cache Manager Utility
 * Helper function for cache invalidation
 */

const { invalidateCache } = require('../middleware/cache');

/**
 * Invalidate cache by pattern
 * Wrapper function for easy use in services
 * @param {string} pattern - Route pattern (e.g., '/api/products')
 * @returns {Promise<number>} Number of keys deleted
 */
async function invalidateCachePattern(pattern) {
  try {
    const count = await invalidateCache(pattern);
    return count;
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error.message);
    return 0;
  }
}

module.exports = {
  invalidateCache: invalidateCachePattern
};
