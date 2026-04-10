const db = require('./config/database');

async function checkNotifications() {
  try {
    console.log('Checking notifications...\n');
    
    const [notifications] = await db.query(`
      SELECT 
        n.*,
        u.full_name as user_name,
        u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${notifications.length} notification(s):\n`);
    notifications.forEach(notif => {
      console.log(`ID: ${notif.id}`);
      console.log(`User: ${notif.user_name} (${notif.user_email}) - ID: ${notif.user_id}`);
      console.log(`Title: ${notif.title}`);
      console.log(`Message: ${notif.message}`);
      console.log(`Type: ${notif.type}`);
      console.log(`Read: ${notif.is_read ? 'Yes' : 'No'}`);
      console.log(`Created: ${notif.created_at}`);
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkNotifications();
