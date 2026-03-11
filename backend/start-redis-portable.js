/**
 * Start Redis Server (Portable)
 * Downloads and runs Redis for Windows if Memurai not working
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('');
console.log('='.repeat(60));
console.log('🔷 Redis Portable Server');
console.log('='.repeat(60));
console.log('');

// Check if redis-server.exe exists in common locations
const possiblePaths = [
  'C:\\Program Files\\Memurai\\memurai.exe',
  'C:\\Program Files\\Redis\\redis-server.exe',
  'C:\\Redis\\redis-server.exe',
  path.join(__dirname, 'redis-server.exe')
];

let redisPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    redisPath = p;
    console.log(`✅ Found Redis at: ${p}`);
    break;
  }
}

if (!redisPath) {
  console.log('❌ Redis executable not found!');
  console.log('');
  console.log('Options:');
  console.log('1. Install Memurai: https://www.memurai.com/get-memurai');
  console.log('2. Or download Redis for Windows:');
  console.log('   https://github.com/tporadowski/redis/releases');
  console.log('');
  console.log('After installation, restart this script.');
  process.exit(1);
}

console.log('');
console.log('Starting Redis server...');
console.log('Port: 6379');
console.log('');
console.log('Press Ctrl+C to stop');
console.log('='.repeat(60));
console.log('');

// Start Redis server
const redis = spawn(redisPath, ['--port', '6379'], {
  stdio: 'inherit'
});

redis.on('error', (err) => {
  console.error('❌ Failed to start Redis:', err.message);
  process.exit(1);
});

redis.on('close', (code) => {
  console.log('');
  console.log(`Redis server stopped (exit code: ${code})`);
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('');
  console.log('Stopping Redis server...');
  redis.kill();
});
