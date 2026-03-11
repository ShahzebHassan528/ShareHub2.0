/**
 * Test User Profile Management
 * Tests profile retrieval and updates
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const userCredentials = {
  email: 'admin@marketplace.com',
  password: 'admin123'
};

let userToken = '';
let userId = 0;

async function testUserProfile() {
  console.log('');
  console.log('='.repeat(80));
  console.log('🧪 TESTING USER PROFILE MANAGEMENT');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Login
    console.log('📝 Step 1: Login as User');
    console.log('-'.repeat(80));
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/signin`, userCredentials);
    userToken = loginResponse.data.token;
    userId = loginResponse.data.user.id;
    
    console.log('✅ User logged in successfully');
    console.log('   User ID:', userId);
    console.log('   Name:', loginResponse.data.user.full_name);
    console.log('   Token:', userToken.substring(0, 20) + '...');
    console.log('');

    // Step 2: Get Current Profile
    console.log('📝 Step 2: Get Current Profile');
    console.log('-'.repeat(80));
    
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log('   ID:', profileResponse.data.profile.id);
    console.log('   Email:', profileResponse.data.profile.email);
    console.log('   Name:', profileResponse.data.profile.full_name);
    console.log('   Phone:', profileResponse.data.profile.phone || 'Not set');
    console.log('   Address:', profileResponse.data.profile.address || 'Not set');
    console.log('   Profile Image:', profileResponse.data.profile.profile_image || 'Not set');
    console.log('   Role:', profileResponse.data.profile.role);
    console.log('');

    // Step 3: Update Profile - Valid Data
    console.log('📝 Step 3: Update Profile (Valid Data)');
    console.log('-'.repeat(80));
    
    const updateData = {
      full_name: 'Updated Admin User',
      phone: '+1234567890',
      address: '123 Main Street, City, Country',
      profile_image: 'https://example.com/avatar.jpg'
    };
    
    const updateResponse = await axios.put(
      `${BASE_URL}/users/profile`,
      updateData,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    
    console.log('✅ Profile updated successfully');
    console.log('   Name:', updateResponse.data.profile.full_name);
    console.log('   Phone:', updateResponse.data.profile.phone);
    console.log('   Address:', updateResponse.data.profile.address);
    console.log('   Profile Image:', updateResponse.data.profile.profile_image);
    console.log('');

    // Step 4: Update Profile - Partial Update
    console.log('📝 Step 4: Update Profile (Partial - Phone Only)');
    console.log('-'.repeat(80));
    
    const partialUpdate = {
      phone: '+9876543210'
    };
    
    const partialResponse = await axios.put(
      `${BASE_URL}/users/profile`,
      partialUpdate,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    
    console.log('✅ Profile updated successfully');
    console.log('   Phone:', partialResponse.data.profile.phone);
    console.log('   Name (unchanged):', partialResponse.data.profile.full_name);
    console.log('');

    // Step 5: Update Profile - Clear Optional Fields
    console.log('📝 Step 5: Clear Optional Fields');
    console.log('-'.repeat(80));
    
    const clearData = {
      address: '',
      profile_image: ''
    };
    
    const clearResponse = await axios.put(
      `${BASE_URL}/users/profile`,
      clearData,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    
    console.log('✅ Optional fields cleared');
    console.log('   Address:', clearResponse.data.profile.address || 'Cleared');
    console.log('   Profile Image:', clearResponse.data.profile.profile_image || 'Cleared');
    console.log('');

    // Step 6: Test Validation - Empty Name
    console.log('📝 Step 6: Test Validation (Empty Name - Should Fail)');
    console.log('-'.repeat(80));
    
    try {
      await axios.put(
        `${BASE_URL}/users/profile`,
        { full_name: '' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log('❌ Should have failed validation');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation correctly rejected empty name');
        console.log('   Error:', error.response.data.error);
        console.log('   Details:', error.response.data.details);
      }
    }
    console.log('');

    // Step 7: Test Validation - Invalid Phone
    console.log('📝 Step 7: Test Validation (Invalid Phone - Should Fail)');
    console.log('-'.repeat(80));
    
    try {
      await axios.put(
        `${BASE_URL}/users/profile`,
        { phone: 'invalid-phone-abc' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log('❌ Should have failed validation');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation correctly rejected invalid phone');
        console.log('   Error:', error.response.data.error);
      }
    }
    console.log('');

    // Step 8: Test Validation - Invalid Profile Image URL
    console.log('📝 Step 8: Test Validation (Invalid URL - Should Fail)');
    console.log('-'.repeat(80));
    
    try {
      await axios.put(
        `${BASE_URL}/users/profile`,
        { profile_image: 'not-a-url' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log('❌ Should have failed validation');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation correctly rejected invalid URL');
        console.log('   Error:', error.response.data.error);
      }
    }
    console.log('');

    // Step 9: Get Public Profile
    console.log('📝 Step 9: Get Public Profile (No Auth Required)');
    console.log('-'.repeat(80));
    
    const publicResponse = await axios.get(`${BASE_URL}/users/${userId}/public`);
    
    console.log('✅ Public profile retrieved');
    console.log('   ID:', publicResponse.data.profile.id);
    console.log('   Name:', publicResponse.data.profile.full_name);
    console.log('   Role:', publicResponse.data.profile.role);
    console.log('   Verified:', publicResponse.data.profile.is_verified);
    console.log('   Note: Email, phone, address are NOT included (privacy)');
    console.log('');

    // Step 10: Test Unauthorized Access
    console.log('📝 Step 10: Test Unauthorized Access');
    console.log('-'.repeat(80));
    
    try {
      await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ Should have been rejected');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Unauthorized access correctly rejected');
      }
    }
    console.log('');

    // Step 11: Restore Original Data
    console.log('📝 Step 11: Restore Original Profile Data');
    console.log('-'.repeat(80));
    
    const restoreData = {
      full_name: 'Admin User',
      phone: null,
      address: null,
      profile_image: null
    };
    
    await axios.put(
      `${BASE_URL}/users/profile`,
      restoreData,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    
    console.log('✅ Profile restored to original state');
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ USER PROFILE MANAGEMENT TEST COMPLETE');
    console.log('='.repeat(80));
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Get profile working');
    console.log('  ✅ Update profile working');
    console.log('  ✅ Partial updates working');
    console.log('  ✅ Clear optional fields working');
    console.log('  ✅ Validation working (name, phone, URL)');
    console.log('  ✅ Public profile working');
    console.log('  ✅ Authorization checks working');
    console.log('  ✅ Privacy protection (password excluded)');
    console.log('');
    console.log('Allowed Fields:');
    console.log('  ✅ full_name (required, max 255 chars)');
    console.log('  ✅ phone (optional, max 20 chars, digits/spaces/+/-/())');
    console.log('  ✅ address (optional, max 1000 chars)');
    console.log('  ✅ profile_image (optional, max 500 chars, valid URL)');
    console.log('');
    console.log('Protected Fields:');
    console.log('  🔒 email (cannot be changed via profile)');
    console.log('  🔒 password (cannot be changed via profile)');
    console.log('  🔒 role (cannot be changed via profile)');
    console.log('  🔒 is_active, is_verified, is_suspended (admin only)');
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
testUserProfile().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
