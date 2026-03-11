/**
 * COMPLETE AUTH FLOW DEBUG
 * Traces every step from database to password comparison
 */

const { User: UserModel } = require('./database/models');
const bcrypt = require('bcrypt');

async function debugCompleteFlow() {
  console.log('='.repeat(80));
  console.log('🔍 COMPLETE AUTH FLOW DEBUG - WINDOWS');
  console.log('='.repeat(80));
  console.log('');

  const testEmail = 'admin@marketplace.com';
  const testPassword = 'admin123';

  // STEP 1: Database Query
  console.log('📦 STEP 1: DATABASE QUERY');
  console.log('-'.repeat(80));
  console.log('Query: SELECT * FROM user WHERE email =', testEmail);
  console.log('');

  const user = await UserModel.findOne({
    where: { email: testEmail },
    raw: true
  });

  if (!user) {
    console.error('❌ USER NOT FOUND IN DATABASE');
    console.log('');
    
    // Check all users
    const allUsers = await UserModel.findAll({ raw: true });
    console.log('📋 All users in database:');
    allUsers.forEach(u => {
      console.log(`   - ID: ${u.id}, Email: "${u.email}", Role: ${u.role}`);
    });
    return;
  }

  console.log('✅ User found in database');
  console.log('');
  console.log('📋 COMPLETE USER RECORD:');
  console.log(JSON.stringify(user, null, 2));
  console.log('');

  // STEP 2: Password Analysis
  console.log('📦 STEP 2: PASSWORD ANALYSIS');
  console.log('-'.repeat(80));
  console.log('Stored password value:', user.password);
  console.log('Stored password length:', user.password.length);
  console.log('Stored password first 7 chars:', user.password.substring(0, 7));
  console.log('');

  // Detect hashing algorithm
  let hashType = 'UNKNOWN';
  if (user.password.startsWith('$2b$')) {
    hashType = 'bcrypt';
  } else if (user.password.startsWith('$2a$')) {
    hashType = 'bcrypt (old)';
  } else if (user.password.startsWith('$2y$')) {
    hashType = 'bcrypt (PHP)';
  } else if (user.password.length === 60 && user.password.startsWith('$2')) {
    hashType = 'bcrypt (variant)';
  } else if (user.password.length < 30) {
    hashType = 'PLAIN TEXT (NOT HASHED!)';
  }

  console.log('🔐 Hash type detected:', hashType);
  console.log('');

  // STEP 3: Password Comparison
  console.log('📦 STEP 3: PASSWORD COMPARISON');
  console.log('-'.repeat(80));
  console.log('Incoming password:', testPassword);
  console.log('Incoming password length:', testPassword.length);
  console.log('Incoming password bytes:', Buffer.from(testPassword).toString('hex'));
  console.log('');

  if (hashType === 'PLAIN TEXT (NOT HASHED!)') {
    console.log('⚠️  PASSWORD IS PLAIN TEXT - Direct comparison');
    const match = user.password === testPassword;
    console.log('Direct match result:', match);
  } else {
    console.log('🔐 Using bcrypt.compare()');
    console.log('');
    
    try {
      const match = await bcrypt.compare(testPassword, user.password);
      console.log('✅ bcrypt.compare() result:', match);
      console.log('');

      if (!match) {
        console.log('🔍 DEBUGGING WHY PASSWORD DOES NOT MATCH:');
        console.log('');
        
        // Test with trimmed password
        const trimmedMatch = await bcrypt.compare(testPassword.trim(), user.password);
        console.log('   - With trimmed password:', trimmedMatch);
        
        // Test with different line endings
        const withCRLF = await bcrypt.compare(testPassword + '\r\n', user.password);
        console.log('   - With CRLF (\\r\\n):', withCRLF);
        
        const withLF = await bcrypt.compare(testPassword + '\n', user.password);
        console.log('   - With LF (\\n):', withLF);
        
        // Test case variations
        const lowerMatch = await bcrypt.compare(testPassword.toLowerCase(), user.password);
        console.log('   - Lowercase password:', lowerMatch);
        
        const upperMatch = await bcrypt.compare(testPassword.toUpperCase(), user.password);
        console.log('   - Uppercase password:', upperMatch);
        
        console.log('');
        
        // Try to hash the password and compare
        console.log('🔍 TESTING HASH GENERATION:');
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('   - New hash generated:', newHash.substring(0, 20) + '...');
        const newHashMatch = await bcrypt.compare(testPassword, newHash);
        console.log('   - New hash validates:', newHashMatch);
        console.log('');
      }
    } catch (error) {
      console.error('❌ bcrypt.compare() ERROR:', error.message);
      console.log('');
    }
  }

  // STEP 4: Database Confirmation
  console.log('📦 STEP 4: DATABASE CONFIRMATION');
  console.log('-'.repeat(80));
  
  const dbInfo = await UserModel.sequelize.query('SELECT DATABASE() as db_name', {
    type: UserModel.sequelize.QueryTypes.SELECT
  });
  console.log('Database name:', dbInfo[0].db_name);
  
  const tableInfo = await UserModel.sequelize.query('SHOW TABLES LIKE "user"', {
    type: UserModel.sequelize.QueryTypes.SELECT
  });
  console.log('Table exists:', tableInfo.length > 0 ? 'YES' : 'NO');
  
  const count = await UserModel.count();
  console.log('Total users in table:', count);
  console.log('User ID being matched:', user.id);
  console.log('');

  // STEP 5: Email Case Sensitivity
  console.log('📦 STEP 5: EMAIL CASE SENSITIVITY CHECK');
  console.log('-'.repeat(80));
  console.log('Test email:', testEmail);
  console.log('Stored email:', user.email);
  console.log('Exact match:', testEmail === user.email);
  console.log('Case-insensitive match:', testEmail.toLowerCase() === user.email.toLowerCase());
  console.log('');

  console.log('='.repeat(80));
  console.log('🏁 DEBUG COMPLETE');
  console.log('='.repeat(80));
}

// Run the debug
debugCompleteFlow().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});
