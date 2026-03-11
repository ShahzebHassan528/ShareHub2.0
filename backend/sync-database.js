require('dotenv').config();
const { sequelize } = require('./config/sequelize');

console.log('🔄 Syncing database schema...');

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced successfully!');
    console.log('   All missing columns have been added.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database sync failed:', error.message);
    process.exit(1);
  });
