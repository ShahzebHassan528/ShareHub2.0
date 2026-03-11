console.log('Step 1: Starting server...');

try {
  console.log('Step 2: Loading express...');
  const express = require('express');
  
  console.log('Step 3: Loading cors...');
  const cors = require('cors');
  
  console.log('Step 4: Loading dotenv...');
  require('dotenv').config();
  
  console.log('Step 5: Loading v1 routes...');
  const v1Routes = require('./routes/v1');
  
  console.log('Step 6: Loading legacy routes...');
  const legacyRoutes = require('./routes/legacy');
  
  console.log('Step 7: Loading database config...');
  const db = require('./config/database');
  
  console.log('Step 8: Loading error handlers...');
  const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
  
  console.log('Step 9: Loading security config...');
  const security = require('./config/security');
  
  console.log('Step 10: Loading sequelize...');
  const { sequelize, initializeDatabase } = require('./config/sequelize');
  
  console.log('Step 11: Loading redis...');
  const { initRedis } = require('./config/redis');
  
  console.log('✅ All modules loaded successfully!');
  console.log('Server would start here...');
  
} catch (error) {
  console.error('❌ ERROR at step:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
