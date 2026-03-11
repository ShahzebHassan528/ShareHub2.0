const bcrypt = require('bcrypt');

async function generateHashes() {
  console.log('Generating bcrypt password hashes...\n');
  console.log('='.repeat(60));
  
  const passwords = [
    { label: 'Admin Password', password: 'admin123' },
    { label: 'Buyer Password', password: 'buyer123' },
    { label: 'Seller Password', password: 'seller123' },
    { label: 'NGO Password', password: 'ngo123' }
  ];

  for (const item of passwords) {
    const hash = await bcrypt.hash(item.password, 10);
    console.log(`\n${item.label}: ${item.password}`);
    console.log(`Hash: ${hash}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\nCopy these hashes to backend/database/seed.sql');
  console.log('Replace the password field values in INSERT statements\n');
}

generateHashes().catch(console.error);
