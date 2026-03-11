/**
 * Redis Cache Testing Script
 * Tests Redis connection and caching functionality
 */

const { initRedis, getRedisClient, isRedisAvailable, closeRedis, CACHE_KEYS, CACHE_TTL } = require('./config/redis');
const { 
  invalidateCache, 
  invalidateCacheKey, 
  clearAllCache, 
  getCacheStats 
} = require('./middleware/cache');

console.log('🧪 Starting Redis Cache Tests...\n');

async function testRedisConnection() {
  console.log('📝 Test 1: Redis Connection');
  try {
    await initRedis();
    
    if (isRedisAvailable()) {
      console.log('   ✅ Redis connected successfully');
      const client = getRedisClient();
      console.log('   ✅ Redis client retrieved');
      return true;
    } else {
      console.log('   ❌ Redis not available');
      return false;
    }
  } catch (error) {
    console.error('   ❌ Redis connection failed:', error.message);
    return false;
  }
}

async function testCacheOperations() {
  console.log('\n📝 Test 2: Basic Cache Operations');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  const client = getRedisClient();
  const testKey = 'test:cache:key';
  const testData = { message: 'Hello Redis!', timestamp: Date.now() };

  try {
    // Test SET
    console.log('   Testing SET operation...');
    await new Promise((resolve, reject) => {
      client.setex(testKey, 60, JSON.stringify(testData), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✅ SET successful');

    // Test GET
    console.log('   Testing GET operation...');
    const cachedData = await new Promise((resolve, reject) => {
      client.get(testKey, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      console.log('   ✅ GET successful:', parsed.message);
    } else {
      console.log('   ❌ GET failed - no data returned');
    }

    // Test TTL
    console.log('   Testing TTL...');
    const ttl = await new Promise((resolve, reject) => {
      client.ttl(testKey, (err, ttl) => {
        if (err) reject(err);
        else resolve(ttl);
      });
    });
    console.log(`   ✅ TTL: ${ttl} seconds remaining`);

    // Test DELETE
    console.log('   Testing DELETE operation...');
    await invalidateCacheKey(testKey);
    console.log('   ✅ DELETE successful');

  } catch (error) {
    console.error('   ❌ Cache operations failed:', error.message);
  }
}

async function testCachePatterns() {
  console.log('\n📝 Test 3: Cache Key Patterns');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  const client = getRedisClient();

  try {
    // Create multiple test keys
    const testKeys = [
      `${CACHE_KEYS.PRODUCTS}:/api/products:{}:{}`,
      `${CACHE_KEYS.PRODUCTS}:/api/products:{"id":"1"}:{}`,
      `${CACHE_KEYS.PRODUCTS}:/api/products:{"id":"2"}:{}`,
      `${CACHE_KEYS.CATEGORIES}:/api/categories:{}:{}`
    ];

    console.log('   Creating test cache keys...');
    for (const key of testKeys) {
      await new Promise((resolve, reject) => {
        client.setex(key, 60, JSON.stringify({ test: true }), (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log(`   ✅ Created ${testKeys.length} test keys`);

    // Test pattern matching
    console.log('   Testing pattern invalidation...');
    const deletedCount = await invalidateCache(`${CACHE_KEYS.PRODUCTS}:*`);
    console.log(`   ✅ Invalidated ${deletedCount} keys matching pattern`);

    // Verify categories key still exists
    const categoryExists = await new Promise((resolve, reject) => {
      client.exists(`${CACHE_KEYS.CATEGORIES}:/api/categories:{}:{}`, (err, exists) => {
        if (err) reject(err);
        else resolve(exists);
      });
    });
    console.log(`   ✅ Category key still exists: ${categoryExists === 1}`);

    // Cleanup
    await invalidateCache(`${CACHE_KEYS.CATEGORIES}:*`);

  } catch (error) {
    console.error('   ❌ Pattern test failed:', error.message);
  }
}

async function testCacheStats() {
  console.log('\n📝 Test 4: Cache Statistics');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  try {
    const stats = await getCacheStats();
    
    if (stats.available) {
      console.log('   ✅ Cache statistics retrieved:');
      console.log(`      - Total connections: ${stats.total_connections_received || 'N/A'}`);
      console.log(`      - Total commands: ${stats.total_commands_processed || 'N/A'}`);
      console.log(`      - Keyspace hits: ${stats.keyspace_hits || 'N/A'}`);
      console.log(`      - Keyspace misses: ${stats.keyspace_misses || 'N/A'}`);
      
      if (stats.keyspace_hits && stats.keyspace_misses) {
        const hitRate = (parseInt(stats.keyspace_hits) / 
          (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses)) * 100).toFixed(2);
        console.log(`      - Hit rate: ${hitRate}%`);
      }
    } else {
      console.log('   ❌ Cache not available');
    }
  } catch (error) {
    console.error('   ❌ Stats retrieval failed:', error.message);
  }
}

async function testCacheTTL() {
  console.log('\n📝 Test 5: Cache TTL Expiration');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  const client = getRedisClient();
  const testKey = 'test:ttl:key';

  try {
    // Set key with 3 second TTL
    console.log('   Setting key with 3 second TTL...');
    await new Promise((resolve, reject) => {
      client.setex(testKey, 3, JSON.stringify({ test: true }), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check immediately
    let exists = await new Promise((resolve, reject) => {
      client.exists(testKey, (err, exists) => {
        if (err) reject(err);
        else resolve(exists);
      });
    });
    console.log(`   ✅ Key exists immediately: ${exists === 1}`);

    // Wait 4 seconds
    console.log('   Waiting 4 seconds for expiration...');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Check after expiration
    exists = await new Promise((resolve, reject) => {
      client.exists(testKey, (err, exists) => {
        if (err) reject(err);
        else resolve(exists);
      });
    });
    console.log(`   ✅ Key expired after TTL: ${exists === 0}`);

  } catch (error) {
    console.error('   ❌ TTL test failed:', error.message);
  }
}

async function runAllTests() {
  try {
    console.log('='.repeat(60));
    console.log('REDIS CACHE TESTING SUITE');
    console.log('='.repeat(60) + '\n');

    const connected = await testRedisConnection();
    
    if (connected) {
      await testCacheOperations();
      await testCachePatterns();
      await testCacheStats();
      await testCacheTTL();
    } else {
      console.log('\n⚠️  Redis not available - skipping remaining tests');
      console.log('   Make sure Redis server is running:');
      console.log('   - Windows: Download from https://github.com/microsoftarchive/redis/releases');
      console.log('   - Or use Docker: docker run -d -p 6379:6379 redis');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await closeRedis();
    console.log('\n✅ Redis connection closed');
  }
}

// Run tests
runAllTests();
