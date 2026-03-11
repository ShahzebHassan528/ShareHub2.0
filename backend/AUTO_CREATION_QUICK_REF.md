# Database Auto-Creation - Quick Reference

## What It Does

Automatically creates the MySQL database if it doesn't exist when the application starts.

## How to Use

### Automatic (Default)
Just start your server:
```bash
npm run dev
```

The database will be created automatically if needed.

### Test It
```bash
npm run test:db-creation
```

## Expected Output

### Database Exists
```
🔍 Checking if database exists...
✅ Database 'marketplace_db' already exists.
✅ Database initialization complete!
```

### Database Created
```
🔍 Checking if database exists...
📦 Database 'marketplace_db' not found. Creating...
✅ Database 'marketplace_db' created successfully!
✅ Database initialization complete!
```

## Common Issues

### MySQL Not Running
```
❌ Error: connect ECONNREFUSED
💡 Tip: Make sure MySQL server is running.
```

**Fix:**
```bash
# Linux
sudo systemctl start mysql

# Windows
net start MySQL80

# macOS
brew services start mysql
```

### Wrong Credentials
```
❌ Error: Access denied for user 'root'@'localhost'
💡 Tip: Check your database credentials in .env file.
```

**Fix:** Update `.env` with correct credentials:
```env
DB_USER=root
DB_PASSWORD=your_actual_password
```

### No Permission
```
❌ Error: Access denied; you need CREATE privilege
```

**Fix:** Grant permissions:
```sql
GRANT ALL PRIVILEGES ON *.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## Configuration

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace_db
```

### Database Settings
- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

## Functions Available

```javascript
const { 
  ensureDatabaseExists,    // Check and create database
  testConnection,          // Test Sequelize connection
  initializeDatabase       // Full initialization (recommended)
} = require('./config/sequelize');

// Use in your code
await initializeDatabase();
```

## Testing Commands

```bash
# Test database creation
npm run test:db-creation

# Test full Sequelize setup
npm run test:sequelize

# Start development server
npm run dev
```

## Platform Support

✅ Linux (Ubuntu, Debian, CentOS, etc.)  
✅ Windows (10, 11, Server)  
✅ macOS (Intel & Apple Silicon)  

## Security Notes

- ✅ Use `.env` for credentials
- ✅ Add `.env` to `.gitignore`
- ✅ Use strong passwords
- ⚠️ In production, pre-create database manually
- ⚠️ Use restricted user without CREATE DATABASE permission in production

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Start MySQL service |
| Access denied | Check credentials in `.env` |
| No CREATE permission | Grant privileges to user |
| Database exists but empty | Run `bash setup-database.sh` |
| Wrong character set | Recreate database with utf8mb4 |

## Next Steps After Creation

1. **Create tables**: Run `bash setup-database.sh`
2. **Seed data**: Script will ask if you want sample data
3. **Start server**: Run `npm run dev`
4. **Test API**: `curl http://localhost:5000/api/test-db`

## More Information

See `DATABASE_AUTO_CREATION.md` for comprehensive documentation.
