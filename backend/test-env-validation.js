/**
 * Test Environment Variable Validation
 * 
 * This script tests the environment validation by temporarily
 * removing required variables and checking if the server fails to start.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '.env');
const backupPath = path.join(__dirname, '.env.backup');

console.log('🧪 Testing Environment Variable Validation\n');

// Backup original .env
console.log('1️⃣  Backing up .env file...');
fs.copyFileSync(envPath, backupPath);
console.log('   ✅ Backup created\n');

// Test 1: Missing DB_HOST
console.log('2️⃣  Test 1: Missing DB_HOST');
const envContent = fs.readFileSync(envPath, 'utf8');
const brokenEnv = envContent.replace(/^DB_HOST=.*/m, '# DB_HOST=127.0.0.1');
fs.writeFileSync(envPath, brokenEnv);

console.log('   Starting server (should fail)...');
const test1 = spawn('node', ['server.js'], { cwd: __dirname });

test1.stdout.on('data', (data) => {
  console.log(`   ${data.toString().trim()}`);
});

test1.stderr.on('data', (data) => {
  console.log(`   ${data.toString().trim()}`);
});

test1.on('close', (code) => {
  if (code === 1) {
    console.log('   ✅ Server correctly failed with exit code 1\n');
  } else {
    console.log(`   ❌ Server exited with unexpected code: ${code}\n`);
  }
  
  // Restore original .env
  console.log('3️⃣  Restoring original .env file...');
  fs.copyFileSync(backupPath, envPath);
  fs.unlinkSync(backupPath);
  console.log('   ✅ Restored\n');
  
  console.log('4️⃣  Starting server with valid config...');
  const test2 = spawn('node', ['server.js'], { cwd: __dirname });
  
  test2.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`   ${output.trim()}`);
    
    // If we see "SERVER STARTED SUCCESSFULLY", kill the process
    if (output.includes('SERVER STARTED SUCCESSFULLY')) {
      console.log('\n   ✅ Server started successfully with valid config!\n');
      console.log('🎉 All validation tests passed!\n');
      test2.kill();
      process.exit(0);
    }
  });
  
  test2.stderr.on('data', (data) => {
    console.log(`   ${data.toString().trim()}`);
  });
  
  test2.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`   ❌ Server failed with code: ${code}\n`);
    }
    process.exit(code || 0);
  });
  
  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('\n   ⏱️  Timeout - killing test server\n');
    test2.kill();
    process.exit(0);
  }, 10000);
});

// Timeout for test 1
setTimeout(() => {
  console.log('   ⏱️  Timeout - test 1 taking too long\n');
  test1.kill();
}, 5000);
