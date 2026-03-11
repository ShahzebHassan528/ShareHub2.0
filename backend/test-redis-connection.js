/**
 * Test Redis Connection
 * Simple script to verify Redis/Memurai is working
 */

require('dotenv').config();
const redis = require('redis');

async function testRedisConnection() {
  console.log('');
  console.log('='.repeat(60));
  console.log('🔷 Testing Redis Connection');
  console.log('='.repeat(60));
  console.log('');

  const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
  const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;

  console.log(`Connecting to Redis at ${REDIS_HOST}:${REDIS_PORT}...`);
  console.log('');

  const client = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retry_strategy: (options) => {
      if (options.attempt > 3) {
        console.log('❌ Connection failed after 3 attempts');
        return undefined;
      }
      console.log(`Retry attempt ${options.attempt}...`);
      return 1000;
    }
  });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('❌ Connection timeout!');
      console.log('');
      console.log('Troubleshooting:');
      console.log('1. Check if Memurai service is running:');
      console.log('   Get-Service Memurai');
      console.log('');
      console.log('2. Start Memurai service:');
      console.log('   Start-Service Memurai');
      console.log('');
      console.log('3. Check port 6379:');
      console.log('   netstat -ano | findstr :6379');
      console.log('');
      client.quit();
      resolve(false);
    }, 5000);

    client.on('ready', () => {
      clearTimeout(timeout);
      console.log('✅ Redis Connected Successfully!');
      console.log('');
      
      // Test PING command
      client.ping((err, reply) => {
        if (err) {
          console.log('❌ PING failed:', err.message);
        } else {
          console.log('✅ PING response:', reply);
        }
        
        // Test SET/GET
        client.set('test_key', 'Hello Redis!', (err) => {
          if (err) {
            console.log('❌ SET failed:', err.message);
          } else {
            console.log('✅ SET test_key = "Hello Redis!"');
            
            client.get('test_key', (err, value) => {
              if (err) {
                console.log('❌ GET failed:', err.message);
              } else {
                console.log('✅ GET test_key =', value);
              }
              
              // Cleanup
              client.del('test_key');
              
              console.log('');
              console.log('='.repeat(60));
              console.log('✅ Redis is working perfectly!');
              console.log('='.repeat(60));
              console.log('');
              console.log('Now restart your backend server:');
              console.log('  cd backend');
              console.log('  node server.js');
              console.log('');
              
              client.quit();
              resolve(true);
            });
          }
        });
      });
    });

    client.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        clearTimeout(timeout);
        console.log('❌ Connection Refused!');
        console.log('');
        console.log('Redis/Memurai is not running on port 6379');
        console.log('');
        console.log('Quick Fix:');
        console.log('1. Open PowerShell as Administrator');
        console.log('2. Run: Start-Service Memurai');
        console.log('3. Run this test again');
        console.log('');
        client.quit();
        resolve(false);
      }
    });
  });
}

testRedisConnection().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
