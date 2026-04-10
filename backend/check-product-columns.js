const { sequelize } = require('./database/models');

async function checkColumns() {
  try {
    const [results] = await sequelize.query(`
      DESCRIBE products;
    `);
    
    console.log('Products table columns:');
    console.log('='.repeat(80));
    results.forEach(col => {
      console.log(`${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | Null: ${col.Null} | Default: ${col.Default}`);
    });
    
    // Check if blocking columns exist
    const blockColumns = ['blocked_at', 'blocked_by', 'block_reason'];
    console.log('\n' + '='.repeat(80));
    console.log('Blocking columns status:');
    blockColumns.forEach(col => {
      const exists = results.find(r => r.Field === col);
      console.log(`${col.padEnd(20)}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
