const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Use Sequelize wrapper - FORCE ENABLED (no fallback)
const User = require('../models/User.sequelize.wrapper');
const Seller = require('../models/Seller.sequelize.wrapper');
const NGO = require('../models/NGO.sequelize.wrapper');

const router = express.Router();

// Log which models are being used
console.log(`🔧 Auth routes initialized with Sequelize ORM models (User, Seller, NGO) - FORCED MODE`);

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, phone, role, ...additionalData } = req.body;

    console.log('📝 Signup request received for email:', email, 'role:', role);

    // Validate role (admin not allowed in signup)
    if (!['buyer', 'seller', 'ngo'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      console.log('⚠️  Signup failed: Email already registered');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (buyers are auto-verified, sellers and NGOs need approval)
    const isVerified = role === 'buyer';
    
    const userId = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role,
      is_verified: isVerified
    });

    console.log('✅ User created successfully with ID:', userId);

    // Create role-specific profile
    if (role === 'seller') {
      await Seller.create({
        user_id: userId,
        business_name: additionalData.business_name,
        business_address: additionalData.business_address,
        business_license: additionalData.business_license,
        tax_id: additionalData.tax_id
      });
      console.log('✅ Seller profile created for user ID:', userId);
    } else if (role === 'ngo') {
      await NGO.create({
        user_id: userId,
        ngo_name: additionalData.ngo_name,
        registration_number: additionalData.registration_number,
        address: additionalData.address,
        website: additionalData.website,
        description: additionalData.description,
        certificate_document: additionalData.certificate_document
      });
      console.log('✅ NGO profile created for user ID:', userId);
    }

    // Generate token
    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Different messages based on role
    let message = 'Account created successfully';
    if (role === 'buyer') {
      message = 'Account created successfully! You can start shopping now.';
    } else if (role === 'seller') {
      message = 'Seller account created! Waiting for admin approval.';
    } else if (role === 'ngo') {
      message = 'NGO account created! Waiting for admin verification.';
    }

    console.log('✅ Signup successful for:', email);

    res.status(201).json({
      message,
      token,
      user: { id: userId, email, full_name, role, is_verified: isVerified }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    console.log('');
    console.log('='.repeat(80));
    console.log('🔐 SIGNIN REQUEST RECEIVED');
    console.log('='.repeat(80));
    console.log('📋 Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('📋 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('');
    
    const { email, password } = req.body;

    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password ? password.length : 0);
    console.log('🔑 Password first 3 chars:', password ? password.substring(0, 3) + '***' : 'EMPTY');
    console.log('🔑 Password bytes:', password ? Buffer.from(password).toString('hex') : 'NONE');

    // Find user
    console.log('🔍 Looking up user in database...');
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log('❌ User not found in database');
      console.log('='.repeat(80));
      console.log('');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("===== LOGIN DEBUG =====");
    console.log("EMAIL FROM FRONTEND:", email);
    console.log("USER FOUND:", user);
    console.log("STORED PASSWORD:", user?.password);
    console.log("INCOMING PASSWORD:", password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("PASSWORD MATCH RESULT:", isMatch);
    console.log("========================");
    
    if (!isMatch) {
      console.log('❌ Password does not match!');
      console.log('='.repeat(80));
      console.log('');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password matches!');
    console.log('');

    // Check if account is active
    if (!user.is_active) {
      console.log('❌ Account is deactivated');
      console.log('='.repeat(80));
      console.log('');
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    console.log('✅ Account is active');
    console.log('');

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    console.log('✅ JWT token generated');
    console.log('   Token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('');

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified
      }
    };

    console.log('📤 Sending success response:');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('='.repeat(80));
    console.log('');

    res.json(responseData);
  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ SIGNIN ERROR');
    console.error('='.repeat(80));
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('='.repeat(80));
    console.error('');
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

module.exports = router;
