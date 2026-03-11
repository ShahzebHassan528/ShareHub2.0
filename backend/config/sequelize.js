const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2/promise');
require('dotenv').config();

/**
 * Validate and enforce required environment variables
 * Fails startup if any required variable is missing or invalid
 */
const validateEnvironment = () => {
  console.log('🔍 Validating environment variables...');
  
  const required = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD, // Can be empty for XAMPP
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET
  };
  
  const missing = [];
  const invalid = [];
  
  // Check for missing variables (except DB_PASSWORD which can be empty)
  Object.entries(required).forEach(([key, value]) => {
    if (key === 'DB_PASSWORD') {
      // DB_PASSWORD can be empty string for XAMPP, but must be defined
      if (value === undefined) {
        missing.push(key);
      }
    } else if (!value || value.trim() === '') {
      missing.push(key);
    }
  });
  
  // Validate specific values
  if (required.DB_HOST && required.DB_HOST !== '127.0.0.1' && required.DB_HOST !== 'localhost') {
    invalid.push(`DB_HOST must be '127.0.0.1' or 'localhost' (got: '${required.DB_HOST}')`);
  }
  
  if (required.DB_PORT && isNaN(parseInt(required.DB_PORT))) {
    invalid.push(`DB_PORT must be a number (got: '${required.DB_PORT}')`);
  } else if (required.DB_PORT && parseInt(required.DB_PORT) !== 3306) {
    console.warn(`⚠️  Warning: DB_PORT is ${required.DB_PORT}, expected 3306 for XAMPP`);
  }
  
  if (required.DB_USER && required.DB_USER !== 'root') {
    console.warn(`⚠️  Warning: DB_USER is '${required.DB_USER}', XAMPP default is 'root'`);
  }
  
  if (required.NODE_ENV && !['development', 'production', 'test'].includes(required.NODE_ENV)) {
    invalid.push(`NODE_ENV must be 'development', 'production', or 'test' (got: '${required.NODE_ENV}')`);
  }
  
  // Report errors
  if (missing.length > 0 || invalid.length > 0) {
    console.error('');
    console.error('❌ ENVIRONMENT VALIDATION FAILED!');
    console.error('');
    
    if (missing.length > 0) {
      console.error('Missing required variables:');
      missing.forEach(key => console.error(`   - ${key}`));
      console.error('');
    }
    
    if (invalid.length > 0) {
      console.error('Invalid variable values:');
      invalid.forEach(msg => console.error(`   - ${msg}`));
      console.error('');
    }
    
    console.error('Please check your .env file in the backend directory.');
    console.error('');
    console.error('Expected configuration for XAMPP:');
    console.error('   DB_HOST=127.0.0.1');
    console.error('   DB_PORT=3306');
    console.error('   DB_USER=root');
    console.error('   DB_PASSWORD=');
    console.error('   DB_NAME=marketplace_db');
    console.error('   NODE_ENV=development');
    console.error('   JWT_SECRET=your_secret_key');
    console.error('');
    
    // Fail startup
    process.exit(1);
  }
  
  // Log loaded configuration (without exposing secrets)
  console.log('✅ Environment validation passed!');
  console.log('');
  console.log('📋 Loaded Configuration:');
  console.log(`   DB_HOST: ${required.DB_HOST}`);
  console.log(`   DB_PORT: ${required.DB_PORT}`);
  console.log(`   DB_USER: ${required.DB_USER}`);
  console.log(`   DB_PASSWORD: ${required.DB_PASSWORD === '' ? '(empty)' : '***hidden***'}`);
  console.log(`   DB_NAME: ${required.DB_NAME}`);
  console.log(`   NODE_ENV: ${required.NODE_ENV}`);
  console.log(`   JWT_SECRET: ${required.JWT_SECRET ? '***hidden***' : 'NOT SET'}`);
  console.log('');
  
  return true;
};

// Validate environment before proceeding
validateEnvironment();

// Database configuration - Optimized for XAMPP MySQL on Windows
const dbConfig = {
  host: process.env.DB_HOST === 'localhost' ? '127.0.0.1' : process.env.DB_HOST, // Convert localhost to 127.0.0.1
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Can be empty for XAMPP
  database: process.env.DB_NAME
};

console.log('🔧 Database Configuration (Validated):');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Password: ${dbConfig.password === '' ? '(empty - XAMPP default)' : '***hidden***'}`);
console.log(`   Database: ${dbConfig.database}`);
console.log('');

/**
 * Check if database exists and create it if it doesn't
 * Uses pure Sequelize/mysql2 - NO CLI or system PATH dependencies
 * Optimized for XAMPP MySQL on Windows
 */
const ensureDatabaseExists = async () => {
  let connection;
  
  console.log('');
  console.log('📦 STEP 1: Database Existence Check');
  console.log('-'.repeat(60));
  
  try {
    console.log('🔌 Connecting to MySQL server (without database)...');
    console.log(`   Target: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   User: ${dbConfig.user}`);
    
    // Connect to MySQL without specifying a database - XAMPP optimized
    connection = await mysql2.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      connectTimeout: 10000, // 10 second timeout
      // XAMPP/Windows specific settings
      ssl: false, // Disable SSL for local XAMPP
      socketPath: undefined, // Force TCP/IP, no socket
      insecureAuth: true // Allow old authentication method
    });

    console.log('✅ Connected to MySQL server successfully!');
    console.log('');
    console.log('🔍 Checking if database exists...');
    console.log(`   Database name: ${dbConfig.database}`);

    // Check if database exists
    const [databases] = await connection.query(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbConfig.database]
    );

    if (databases.length === 0) {
      // Database doesn't exist, create it
      console.log('');
      console.log('⚠️  Database not found!');
      console.log('📝 Creating database...');
      
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      
      console.log(`✅ Database '${dbConfig.database}' created successfully!`);
      console.log('   Character Set: utf8mb4');
      console.log('   Collation: utf8mb4_unicode_ci');
    } else {
      console.log(`✅ Database '${dbConfig.database}' already exists.`);
      console.log('   Skipping creation.');
    }
    
    console.log('-'.repeat(60));
    console.log('');
    return true;
    
  } catch (error) {
    console.log('');
    console.error('❌ Database check/creation failed!');
    console.error('-'.repeat(60));
    console.error(`   Error Code: ${error.code || 'UNKNOWN'}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   SQL State: ${error.sqlState || 'N/A'}`);
    console.error('');
    
    // Provide detailed helpful error messages for XAMPP
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 MySQL Connection Refused - Troubleshooting:');
      console.error('   1. Open XAMPP Control Panel');
      console.error('   2. Click "Start" button next to MySQL');
      console.error('   3. Wait for MySQL to show "Running" status');
      console.error('   4. Restart this application');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Access Denied - Check Credentials:');
      console.error('   XAMPP Default: username=root, password=(empty)');
      console.error('   Update your .env file with correct credentials');
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      console.error('💡 Host Not Found:');
      console.error('   Try using 127.0.0.1 instead of localhost');
      console.error('   Update DB_HOST=127.0.0.1 in .env file');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('💡 Connection Timeout:');
      console.error('   MySQL server is not responding');
      console.error('   Check if MySQL is running in XAMPP');
    }
    
    console.error('-'.repeat(60));
    console.error('');
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed.');
      console.log('');
    }
  }
};

// Create Sequelize instance - Optimized for XAMPP MySQL on Windows
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    dialectModule: require('mysql2'), // Reuse existing mysql2 driver
    
    // Verbose logging in development for debugging
    logging: process.env.NODE_ENV === 'development' ? (msg) => {
      if (msg.includes('Executing')) {
        console.log('🔷 Sequelize Query:', msg.substring(0, 150) + '...');
      }
    } : false,
    
    // XAMPP/Windows specific dialect options
    dialectOptions: {
      connectTimeout: 10000, // 10 second timeout
      ssl: false, // Disable SSL for local XAMPP
      socketPath: undefined, // Force TCP/IP connection only
      insecureAuth: true, // Allow old authentication method for XAMPP
      decimalNumbers: true,
      dateStrings: true
    },
    
    // Connection pool settings
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    // Model defaults
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    
    // Retry settings for XAMPP
    retry: {
      max: 3,
      timeout: 3000
    }
  }
);

console.log('✅ Sequelize instance created with XAMPP-optimized settings');

/**
 * Test connection function with automatic database creation and retry logic
 * Uses pure Sequelize - NO CLI dependencies
 * @param {boolean} autoCreate - Whether to automatically create database if missing
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async (autoCreate = true, retries = 3) => {
  console.log('📦 STEP 2: Sequelize Connection Test');
  console.log('-'.repeat(60));
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`🔄 Retry attempt ${attempt}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
      }
      
      console.log('🔌 Testing Sequelize connection to database...');
      console.log(`   Database: ${dbConfig.database}`);
      
      await sequelize.authenticate();
      
      console.log('✅ Sequelize connection successful!');
      console.log(`   Connection: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
      console.log(`   Dialect: MySQL (via mysql2)`);
      console.log('-'.repeat(60));
      console.log('');
      return true;
      
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt}/${retries} failed`);
      console.error(`   Error Code: ${error.original?.code || error.code || 'UNKNOWN'}`);
      console.error(`   Error Message: ${error.message}`);
      
      // Check if error is due to missing database
      if (error.original && error.original.code === 'ER_BAD_DB_ERROR' && autoCreate) {
        console.log('');
        console.log('⚠️  Database not found in Sequelize connection.');
        console.log('   This should have been created in Step 1.');
        console.log('   Attempting to create now...');
        console.log('');
        
        // Try to create the database
        const created = await ensureDatabaseExists();
        
        if (created) {
          // Retry connection after database creation
          try {
            console.log('🔄 Retrying Sequelize connection after database creation...');
            await sequelize.authenticate();
            console.log('✅ Sequelize connection successful after database creation!');
            console.log('-'.repeat(60));
            console.log('');
            return true;
          } catch (retryError) {
            console.error('❌ Sequelize connection still failed after database creation');
            console.error(`   Error: ${retryError.message}`);
          }
        } else {
          console.error('❌ Failed to create database');
        }
      }
      
      // Provide detailed helpful error messages for XAMPP
      if (error.original) {
        console.error('');
        if (error.original.code === 'ECONNREFUSED') {
          console.error('💡 XAMPP MySQL Not Running:');
          console.error('   1. Open XAMPP Control Panel');
          console.error('   2. Start MySQL service');
          console.error('   3. Wait for "Running" status');
          console.error('   4. Restart this application');
        } else if (error.original.code === 'ER_ACCESS_DENIED_ERROR') {
          console.error('💡 Wrong Credentials:');
          console.error('   XAMPP default: root / (no password)');
          console.error('   Check your .env file');
        } else if (error.original.code === 'ENOTFOUND') {
          console.error('💡 Host Resolution Failed:');
          console.error('   Use DB_HOST=127.0.0.1 in .env');
        }
      }
      
      // If this was the last attempt, return false
      if (attempt === retries) {
        console.error('');
        console.error('❌ All connection attempts exhausted!');
        console.error('-'.repeat(60));
        console.error('');
        return false;
      }
    }
  }
  
  return false;
};

/**
 * Synchronize Sequelize models with database
 * Creates/updates tables using pure Sequelize - NO CLI dependencies
 * @param {Object} options - Sync options
 * @returns {Promise<boolean>} - True if sync successful
 */
const syncModels = async (options = {}) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const forceSync = options.force === true;
  const alterSync = options.alter === true;
  
  console.log('📦 STEP 3: Model Synchronization');
  console.log('-'.repeat(60));
  
  // Safety check: Never force sync in production
  if (!isDevelopment && forceSync) {
    console.error('❌ CRITICAL: Force sync is disabled in production for safety!');
    console.error('   Use migrations for production schema changes.');
    console.error('-'.repeat(60));
    console.error('');
    return false;
  }
  
  try {
    console.log('🔄 Synchronizing database models...');
    
    if (forceSync) {
      console.warn('⚠️  WARNING: Force sync will DROP all tables and recreate them!');
      console.warn('⚠️  All data will be lost!');
    } else if (alterSync) {
      console.log('   Mode: ALTER (update existing schema)');
    } else {
      console.log('   Mode: SAFE (create tables if missing, no changes to existing)');
    }
    
    // Import models to ensure they're loaded
    const models = require('../database/models');
    const modelNames = Object.keys(models.sequelize.models);
    
    console.log(`   Models to sync: ${modelNames.length}`);
    console.log(`   Models: ${modelNames.join(', ')}`);
    console.log('');
    
    // Sync options
    const syncOptions = {
      force: forceSync,
      alter: alterSync,
      logging: false // Disable query logging during sync for cleaner output
    };
    
    console.log('⏳ Syncing models with database...');
    await sequelize.sync(syncOptions);
    
    console.log('');
    if (forceSync) {
      console.log('✅ Models synchronized (FORCE - all tables recreated)');
    } else if (alterSync) {
      console.log('✅ Models synchronized (ALTER - schema updated)');
    } else {
      console.log('✅ Models synchronized (tables created if missing)');
    }
    
    console.log(`   Total models synced: ${modelNames.length}`);
    console.log('-'.repeat(60));
    console.log('');
    return true;
    
  } catch (error) {
    console.error('');
    console.error('❌ Model synchronization failed!');
    console.error('-'.repeat(60));
    console.error(`   Error: ${error.message}`);
    
    if (error.original) {
      console.error(`   SQL Error: ${error.original.message}`);
      console.error(`   SQL Code: ${error.original.code}`);
    }
    
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check if database exists');
    console.error('   2. Verify user has CREATE TABLE permissions');
    console.error('   3. Check model definitions for errors');
    console.error('   4. Review error message above for details');
    console.error('-'.repeat(60));
    console.error('');
    return false;
  }
};

/**
 * Initialize database with automatic creation and sync if needed
 * Complete initialization using pure Sequelize - NO CLI or PATH dependencies
 * This is the recommended way to initialize the database connection
 * @param {Object} options - Initialization options
 * @param {boolean} options.sync - Whether to sync models (default: true in development)
 * @param {boolean} options.force - Force sync (drops tables) - DEVELOPMENT ONLY
 * @param {boolean} options.alter - Alter sync (updates schema) - DEVELOPMENT ONLY
 * @returns {Promise<boolean>} - True if initialization successful
 */
const initializeDatabase = async (options = {}) => {
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 DATABASE INITIALIZATION - Pure Sequelize (No CLI)');
  console.log('='.repeat(60));
  console.log('');
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const shouldSync = options.sync !== false && isDevelopment; // Default true in dev
  
  let stepsPassed = 0;
  const totalSteps = shouldSync ? 3 : 2;
  
  // STEP 1: Ensure database exists
  console.log(`[Step 1/${totalSteps}] Ensuring database exists...`);
  const dbExists = await ensureDatabaseExists();
  
  if (!dbExists) {
    console.error('');
    console.error('❌ DATABASE INITIALIZATION FAILED!');
    console.error('   Could not ensure database exists.');
    console.error('   Application will continue but may not work correctly.');
    console.error('='.repeat(60));
    console.error('');
    return false;
  }
  stepsPassed++;
  
  // STEP 2: Test Sequelize connection
  console.log(`[Step 2/${totalSteps}] Testing Sequelize connection...`);
  const connected = await testConnection(false); // Don't auto-create again
  
  if (!connected) {
    console.error('');
    console.error('❌ DATABASE INITIALIZATION FAILED!');
    console.error('   Could not establish Sequelize connection.');
    console.error('   Check MySQL server status and credentials.');
    console.error('='.repeat(60));
    console.error('');
    return false;
  }
  stepsPassed++;
  
  // STEP 3: Sync models if enabled
  if (shouldSync) {
    console.log(`[Step 3/${totalSteps}] Synchronizing models...`);
    
    const syncOptions = {
      force: options.force === true,
      alter: options.alter === true
    };
    
    const synced = await syncModels(syncOptions);
    
    if (!synced) {
      console.warn('');
      console.warn('⚠️  WARNING: Model synchronization failed!');
      console.warn('   Connection is established but tables may not exist.');
      console.warn('   You may need to create tables manually.');
      console.warn('');
    } else {
      stepsPassed++;
    }
  } else {
    if (!isDevelopment) {
      console.log('');
      console.log('ℹ️  Model sync disabled in production (recommended)');
      console.log('   Use migrations for production schema changes.');
      console.log('');
    } else {
      console.log('');
      console.log('ℹ️  Model sync disabled by configuration');
      console.log('');
    }
  }
  
  // Final summary
  console.log('='.repeat(60));
  if (stepsPassed === totalSteps) {
    console.log('✅ DATABASE INITIALIZATION COMPLETE!');
    console.log(`   All ${totalSteps}/${totalSteps} steps passed successfully.`);
  } else {
    console.log('⚠️  DATABASE INITIALIZATION PARTIAL!');
    console.log(`   ${stepsPassed}/${totalSteps} steps passed.`);
  }
  console.log('='.repeat(60));
  console.log('');
  
  return stepsPassed === totalSteps;
};

module.exports = { 
  sequelize, 
  testConnection, 
  ensureDatabaseExists,
  syncModels,
  initializeDatabase 
};
