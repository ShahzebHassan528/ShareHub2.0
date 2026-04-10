const db = require('./config/database');

async function checkSwaps() {
  try {
    console.log('Checking all swaps in database...\n');
    
    const [swaps] = await db.query(`
      SELECT 
        ps.*,
        u1.full_name as requester_name,
        u2.full_name as owner_name,
        p1.title as requester_product,
        p2.title as owner_product
      FROM product_swaps ps
      LEFT JOIN users u1 ON ps.requester_id = u1.id
      LEFT JOIN users u2 ON ps.owner_id = u2.id
      LEFT JOIN products p1 ON ps.requester_product_id = p1.id
      LEFT JOIN products p2 ON ps.owner_product_id = p2.id
      ORDER BY ps.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${swaps.length} swap(s):\n`);
    swaps.forEach(swap => {
      console.log(`ID: ${swap.id}`);
      console.log(`Swap Number: ${swap.swap_number}`);
      console.log(`Requester: ${swap.requester_name} (ID: ${swap.requester_id})`);
      console.log(`Owner: ${swap.owner_name} (ID: ${swap.owner_id})`);
      console.log(`Requester Product: ${swap.requester_product} (ID: ${swap.requester_product_id})`);
      console.log(`Owner Product: ${swap.owner_product} (ID: ${swap.owner_product_id})`);
      console.log(`Status: ${swap.status}`);
      console.log(`Created: ${swap.created_at}`);
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSwaps();
