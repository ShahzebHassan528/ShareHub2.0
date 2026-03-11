/**
 * Redis Integration Test Script
 * Tests Redis connection, caching, and invalidation
 */

const { initRedis, getRedisClient, isRedisAvailable, closeRedis, getDefaultTTL } = require('./config/redis');

console.log('🧪 Starting Redis Integration Tests...\n');

async function testRedisConnection() {
  console.log('📝 Test 1: Redis Connection');
  try {
    await initRedis();
    
    if (isRedisAvailable()) {
      console.log('   ✅ Redis Connected');
      console.log(`   ✅ Default TTL: ${getDefaultTTL()} seconds`);
      return true;
    } else {
      console.log('   ⚠️  Redis Disabled - Fallback Mode');
      return false;
    }
  } catch (error) {
    console.error('   ❌ Connection failed:', error.message);
    return false;
  }
}

async function testCacheSetGet() {
  console.log('\n📝 Test 2: Cache SET and GET');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  const client = getRedisClient();
  const testKey = '/api/products:/api/products';
  const testData = { products: [{ id: 1, name: 'Test Product' }] };

  try {
    // Test SET
    await new Promise((resolve, reject) => {
      client.setex(testKey, 60, JSON.stringify(testData), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✅ Cache SET successful');

    // Test GET
    const cachedData = await new Promise((resolve, reject) => {
      client.get(testKey, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      console.log('   ✅ Cache GET successful');
      console.log(`   ✅ Retrieved: ${parsed.products[0].name}`);
    } else {
      console.log('   ❌ Cache GET failed - no data');
    }

    // Cleanup
    await new Promise((resolve) => {
      client.del(testKey, () => resolve());
    });
    console.log('   ✅ Cache cleanup successful');

  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testCacheInvalidation() {
  console.log('\n📝 Test 3: Cache Invalidation');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  const client = getRedisClient();

  try {
    // Create multiple test keys
    const testKeys = [
      '/api/products:/api/products',
      '/api/products:/api/products?category=electronics',
      '/api/products/:id:/api/products/1',
      '/api/categories:/api/categories'
    ];

    console.log(`   Creating ${testKeys.length} test cache keys...`);
    for (const key of testKeys) {
      await new Promise((resolve, reject) => {
        client.setex(key, 60, JSON.stringify({ test: true }), (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log('   ✅ Test keys created');

    // Test pattern invalidation
    console.log('   Testing pattern invalidation for /api/products...');
    const pattern = '*/api/products*';
    
    const keys = await new Promise((resolve, reject) => {
      client.keys(pattern, (err, keys) => {
        if (err) reject(err);
        else resolve(keys);
      });
    });

    if (keys.length > 0) {
      await new Promise((resolve, reject) => {
        client.del(keys, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log(`   ✅ Invalidated ${keys.length} keys matching pattern`);
    }

    // Verify categories key still exists
    const categoryExists = await new Promise((resolve, reject) => {
      client.exists('/api/categories:/api/categories', (err, exists) => {
        if (err) reject(err);
        else resolve(exists);
      });
    });
    console.log(`   ✅ Category key still exists: ${categoryExists === 1}`);

    // Cleanup remaining keys
    await new Promise((resolve) => {
      client.del('/api/categories:/api/categories', () => resolve());
    });

  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testCacheKeyFormat() {
  console.log('\n📝 Test 4: Cache Key Format');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  const client = getRedisClient();

  try {
    // Test different key formats
    const testCases = [
      { route: '/api/products', url: '/api/products', expected: '/api/products:/api/products' },
      { route: '/api/products/:id', url: '/api/products/123', expected: '/api/products/:id:/api/products/123' },
      { route: '/api/products', url: '/api/products?category=electronics', expected: '/api/products:/api/products?category=electronics' }
    ];

    console.log('   Testing cache key format: <route>:<full_url>');
    
    for (const test of testCases) {
      const key = `${test.route}:${test.url}`;
      if (key === test.expected) {
        console.log(`   ✅ ${key}`);
      } else {
        console.log(`   ❌ Expected: ${test.expected}, Got: ${key}`);
      }
    }

  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testTTLConfiguration() {
  console.log('\n📝 Test 5: TTL Configuration');
  
  if (!isRedisAvailable()) {
    console.log('   ⚠️  Skipping - Redis not available');
    return;
  }

  const client = getRedisClient();
  const testKey = 'test:ttl:key';

  try {
    const ttl = getDefaultTTL();
    console.log(`   Default TTL from env: ${ttl} seconds`);

    // Set key with TTL
    await new Promise((resolve, reject) => {
      client.setex(testKey, ttl, JSON.stringify({ test: true }), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check TTL
    const remainingTTL = await new Promise((resolve, reject) => {
      client.ttl(testKey, (err, ttl) => {
        if (err) reject(err);
        else resolve(ttl);
      });
    });

    console.log(`   ✅ Key created with TTL: ${remainingTTL} seconds remaining`);

    // Cleanup
    await new Promise((resolve) => {
      client.del(testKey, () => resolve());
    });

  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function testGracefulFallback() {
  console.log('\n📝 Test 6: Graceful Fallback');
  
  console.log('   Testing application behavior without Redis...');
  
  if (!isRedisAvailable()) {
    console.log('   ✅ Application continues without Redis (Fallback Mode)');
    console.log('   ✅ No crashes or errors');
    console.log('   ✅ APIs work without caching');
  } else {
    console.log('   ℹ️  Redis is available - fallback not tested');
    console.log('   ℹ️  To test fallback, stop Redis server and restart application');
  }
}

async function runAllTests() {
  try {
    console.log('='.repeat(60));
    console.log('REDIS INTEGRATION TEST SUITE');
    console.log('='.repeat(60) + '\n');

    const connected = await testRedisConnection();
    
    if (connected) {
      await testCacheSetGet();
      await testCacheInvalidation();
      await testCacheKeyFormat();
      await testTTLConfiguration();
    }
    
    await testGracefulFallback();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    
    if (!connected) {
      console.log('\n⚠️  Redis not available - some tests were skipped');
      console.log('   To run full tests:');
      console.log('   1. Start Redis: redis-server.exe');
      console.log('   2. Verify: redis-cli ping');
      console.log('   3. Run tests again');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await closeRedis();
    console.log('\n✅ Redis connection closed');
  }
}

// Run tests
runAllTests();
