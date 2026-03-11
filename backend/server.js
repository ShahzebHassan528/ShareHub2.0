const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
require('dotenv').config();

// Validate environment variables before anything else
console.log('');
console.log('='.repeat(60));
console.log('🚀 MARKETPLACE BACKEND SERVER - STARTUP');
console.log('='.repeat(60));
console.log('');

// Validate critical environment variables
const validateStartupEnvironment = () => {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'NODE_ENV', 'JWT_SECRET'];
  const missing = required.filter(key => {
    // DB_PASSWORD can be empty for XAMPP
    if (key === 'DB_PASSWORD') return false;
    return !process.env[key] || process.env[key].trim() === '';
  });
  
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables!');
    console.error('   Missing:', missing.join(', '));
    console.error('');
    console.error('   Please create/update backend/.env file with:');
    console.error('   DB_HOST=127.0.0.1');
    console.error('   DB_PORT=3306');
    console.error('   DB_USER=root');
    console.error('   DB_PASSWORD=');
    console.error('   DB_NAME=marketplace_db');
    console.error('   NODE_ENV=development');
    console.error('   JWT_SECRET=your_secret_key');
    console.error('');
    process.exit(1);
  }
  
  console.log('✅ Critical environment variables present');
};

validateStartupEnvironment();

// API Routes
const v1Routes = require('./routes/v1');
const legacyRoutes = require('./routes/legacy');
const db = require('./config/database');

// Error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Security configuration
const { 
  authLimiter, 
  apiLimiter, 
  corsOptions, 
  helmetConfig, 
  hppConfig 
} = require('./config/security');

// Sequelize setup (new - coexists with raw SQL)
// This will perform detailed validation and logging
const { sequelize, initializeDatabase } = require('./config/sequelize');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// SECURITY MIDDLEWARE (Applied in order)
// ============================================================

// 1. Helmet - Set security HTTP headers
app.use(helmet(helmetConfig));

// 2. CORS - Enable Cross-Origin Resource Sharing with strict config
app.use(cors(corsOptions));

// 3. Body parser - Parse JSON bodies (limit size to prevent DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. XSS Clean - Sanitize user input to prevent XSS attacks
app.use(xss());

// 5. HPP - Prevent HTTP Parameter Pollution
app.use(hpp(hppConfig));

// 6. Rate limiting - Apply to all routes
app.use('/api/', apiLimiter);

// ============================================================
// STATIC FILE SERVING
// ============================================================

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('📁 Static file serving enabled: /uploads');

// ============================================================
// ROUTES
// ============================================================

console.log('');
console.log('🔧 Registering API routes...');
console.log('');

// API v1 routes (versioned)
app.use('/api/v1', v1Routes);

// Legacy routes (backward compatibility)
app.use('/api', legacyRoutes);

console.log('');
console.log('✅ All routes registered successfully');
console.log('   - Versioned API: /api/v1/*');
console.log('   - Legacy API: /api/* (backward compatible)');
console.log('');

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ 
      message: 'Database connected successfully!', 
      result: rows[0].result 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
});

// Handle 404 errors - must be AFTER all routes
app.use(notFoundHandler);

// Global error handler - must be LAST middleware
app.use(errorHandler);

// Initialize Sequelize connection on startup with automatic database creation
// In development: automatically syncs models (creates tables if missing)
// In production: sync is disabled for safety
const initOptions = {
  sync: true,      // Enable sync in development (auto-disabled in production)
  force: false,    // Never drop tables (set to true only for testing)
  alter: false     // Set to true to update schema (use with caution)
};

initializeDatabase(initOptions).then(connected => {
  if (connected) {
    console.log('✅ Sequelize ORM initialized successfully');
  } else {
    console.warn('⚠️  Sequelize connection failed, but server will continue with raw SQL');
  }
}).catch(error => {
  console.error('❌ Error during database initialization:', error.message);
  console.warn('⚠️  Server will continue, but database operations may fail');
});

app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`   Server URL: http://localhost:${PORT}`);
  console.log(`   API v1: http://localhost:${PORT}/api/v1`);
  console.log(`   API Legacy: http://localhost:${PORT}/api (backward compatible)`);
  console.log(`   Database: MySQL (mysql2 + Sequelize ORM)`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   ORM Status: ${process.env.USE_SEQUELIZE !== 'false' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   Cache: Redis (optional)`);
  console.log(`   Error Handling: Centralized (Global Middleware)`);
  console.log(`   Security: Helmet, Rate Limiting, XSS, HPP, CORS`);
  console.log(`   Authorization: CASL (Role-based + Ownership)`);
  console.log(`   API Versioning: v1 (with legacy support)`);
  console.log('='.repeat(60));
  console.log('');
});
