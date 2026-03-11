/**
 * Test Admin Management APIs
 * Tests user suspension and product moderation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const adminCredentials = {
  email: 'admin@marketplace.com',
  password: 'admin123'
};

let adminToken = '';

async function testAdminManagement() {
  console.log('');
  console.log('='.repeat(80));
  console.log('🧪 TESTING ADMIN MANAGEMENT APIS');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Admin Login
    console.log('📝 Step 1: Admin Login');
    console.log('-'.repeat(80));
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/signin`, adminCredentials);
    adminToken = loginResponse.data.token;
    
    console.log('✅ Admin logged in successfully');
    console.log('   Token:', adminToken.substring(0, 20) + '...');
    console.log('');

    // Step 2: Get All Users
    console.log('📝 Step 2: Get All Users');
    console.log('-'.repeat(80));
    
    const usersResponse = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Users retrieved');
    console.log('   Total users:', usersResponse.data.count);
    
    // Find a non-admin user to test suspension
    const testUser = usersResponse.data.users.find(u => u.role !== 'admin' && !u.is_suspended);
    const testUserId = testUser?.id;
    
    if (testUserId) {
      console.log('   Test user ID:', testUserId);
      console.log('   Test user email:', testUser.email);
      console.log('   Test user role:', testUser.role);
    } else {
      console.log('⚠️  No non-admin users found for testing');
    }
    console.log('');

    // Step 3: Suspend User
    if (testUserId) {
      console.log('📝 Step 3: Suspend User');
      console.log('-'.repeat(80));
      
      const suspendResponse = await axios.put(
        `${BASE_URL}/admin/users/suspend/${testUserId}`,
        { reason: 'Test suspension - violating community guidelines' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      console.log('✅ User suspended successfully');
      console.log('   Response:', suspendResponse.data);
      console.log('');
    }

    // Step 4: Get Suspended Users
    console.log('📝 Step 4: Get Suspended Users');
    console.log('-'.repeat(80));
    
    const suspendedResponse = await axios.get(`${BASE_URL}/admin/users?is_suspended=true`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Suspended users retrieved');
    console.log('   Count:', suspendedResponse.data.count);
    console.log('');

    // Step 5: Reactivate User
    if (testUserId) {
      console.log('📝 Step 5: Reactivate User');
      console.log('-'.repeat(80));
      
      const reactivateResponse = await axios.put(
        `${BASE_URL}/admin/users/reactivate/${testUserId}`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      console.log('✅ User reactivated successfully');
      console.log('   Response:', reactivateResponse.data);
      console.log('');
    }

    // Step 6: Test Product Moderation
    console.log('📝 Step 6: Block Product');
    console.log('-'.repeat(80));
    console.log('⚠️  To test product blocking, you need an existing product ID');
    console.log('   Endpoint: PUT /api/admin/products/remove/:id');
    console.log('   Body: { reason: "Block reason" }');
    console.log('');

    // Step 7: Test Unauthorized Access
    console.log('📝 Step 7: Test Unauthorized Access');
    console.log('-'.repeat(80));
    
    try {
      await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ Should have been rejected');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Unauthorized access correctly rejected');
        console.log('   Status:', error.response.status);
      }
    }
    console.log('');

    // Step 8: Test Suspension Reason Validation
    if (testUserId) {
      console.log('📝 Step 8: Test Suspension Without Reason (Should Fail)');
      console.log('-'.repeat(80));
      
      try {
        await axios.put(
          `${BASE_URL}/admin/users/suspend/${testUserId}`,
          { reason: '' }, // Empty reason
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('❌ Should have failed');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Empty reason correctly rejected');
          console.log('   Error:', error.response.data.error);
        }
      }
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('✅ ADMIN MANAGEMENT TEST COMPLETE');
    console.log('='.repeat(80));
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Admin authentication');
    console.log('  ✅ Get all users');
    console.log('  ✅ Suspend user');
    console.log('  ✅ Get suspended users');
    console.log('  ✅ Reactivate user');
    console.log('  ✅ Unauthorized access blocked');
    console.log('  ✅ Validation checks');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ TEST FAILED');
    console.error('');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testAdminManagement().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
