# Database Auto-Creation Feature

## Overview

The Sequelize configuration now includes automatic database creation functionality. If the configured database doesn't exist, the application will automatically create it before establishing the connection.

## How It Works

### Automatic Process

1. **Check Database Existence**: On startup, the application checks if the configured database exists
2. **Create If Missing**: If the database doesn't exist, it's automatically created
3. **Reconnect**: After creation, Sequelize reconnects to the new database
4. **Graceful Handling**: If creation fails, the application logs the error but doesn't crash

### Technical Implementation

```javascript
// The process flow:
1. ensureDatabaseExists() - Checks and creates database
2. testConnection() - Tests Sequelize connection
3. initializeDatabase() - Combines both steps
```

## Configuration

### Environment Variables

The auto-creation uses the same environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace_db
```

### Database Creation Settings

The database is created with:
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

This ensures proper support for:
- International characters
- Emojis
- Special symbols

## Usage

### Automatic (Recommended)

The database auto-creation happens automatically when you start the server:

```bash
npm run dev
```

**Expected Output:**
```
🚀 Initializing database connection...
🔍 Checking if database exists...
📦 Database 'marketplace_db' not found. Creating...
✅ Database 'marketplace_db' created successfully!
✅ Database initialization complete!
✅ Sequelize ORM initialized successfully
Server running on port 5000
```

### Manual Testing

Test the auto-creation feature independently:

```bash
npm run test:db-creation
```

This will:
- Check if database exists
- Create it if needed
- Test the connection
- Verify database access
- Show existing tables

### Programmatic Usage

You can use the functions in your own scripts:

```javascript
const { ensureDatabaseExists, initializeDatabase } = require('./config/sequelize');

// Option 1: Just ensure database exists
await ensureDatabaseExists();

// Option 2: Full initialization (recommended)
await initializeDatabase();
```

## Cross-Platform Compatibility

### Linux
✅ Fully supported
- Works with systemd MySQL service
- Works with MariaDB
- Works with MySQL 5.7+

### Windows
✅ Fully supported
- Works with MySQL Windows Service
- Works with XAMPP
- Works with WAMP
- Works with standalone MySQL installation

### macOS
✅ Fully supported
- Works with Homebrew MySQL
- Works with MAMP
- Works with standalone MySQL installation

## Error Handling

### Common Errors and Solutions

#### 1. Connection Refused (ECONNREFUSED)

**Error:**
```
❌ Error ensuring database exists: connect ECONNREFUSED
💡 Tip: Make sure MySQL server is running.
```

**Solutions:**

**Linux:**
```bash
# Check status
systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Enable on boot
sudo systemctl enable mysql
```

**Windows:**
```powershell
# Check Services app or run:
net start MySQL80  # Adjust service name as needed
```

**macOS:**
```bash
# Homebrew
brew services start mysql

# Or manually
mysql.server start
```

#### 2. Access Denied (ER_ACCESS_DENIED_ERROR)

**Error:**
```
❌ Error ensuring database exists: Access denied for user 'root'@'localhost'
💡 Tip: Check your database credentials in .env file.
```

**Solutions:**

1. **Verify credentials in `.env`:**
   ```env
   DB_USER=root
   DB_PASSWORD=your_actual_password
   ```

2. **Test credentials manually:**
   ```bash
   mysql -u root -p
   ```

3. **Reset password if needed:**
   ```bash
   # Linux/macOS
   sudo mysql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```

#### 3. Insufficient Permissions

**Error:**
```
❌ Error ensuring database exists: Access denied; you need CREATE privilege
```

**Solution:**

Grant CREATE DATABASE permission:

```sql
-- Connect as root
mysql -u root -p

-- Grant permissions
GRANT ALL PRIVILEGES ON *.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;

-- Or create a specific user
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 4. Database Already Exists

**Output:**
```
✅ Database 'marketplace_db' already exists.
```

This is normal and expected. The application detects the existing database and continues without creating a new one.

## Security Considerations

### 1. User Permissions

**Recommended Approach:**

Create a dedicated database user with limited permissions:

```sql
-- Create user
CREATE USER 'marketplace_app'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER 
ON marketplace_db.* TO 'marketplace_app'@'localhost';

-- For auto-creation, also grant CREATE DATABASE (optional)
GRANT CREATE ON *.* TO 'marketplace_app'@'localhost';

FLUSH PRIVILEGES;
```

**Update `.env`:**
```env
DB_USER=marketplace_app
DB_PASSWORD=secure_password
```

### 2. Production Considerations

**For Production Environments:**

1. **Pre-create the database** manually
2. **Don't rely on auto-creation** in production
3. **Use restricted user** without CREATE DATABASE permission
4. **Set environment variable** to disable auto-creation:

```env
NODE_ENV=production
AUTO_CREATE_DB=false  # Optional flag you can implement
```

### 3. Password Security

- ✅ Always use `.env` file for credentials
- ✅ Add `.env` to `.gitignore`
- ✅ Use strong passwords
- ❌ Never commit credentials to version control
- ❌ Never hardcode passwords in code

## Advanced Configuration

### Custom Database Creation Options

You can modify the database creation query in `config/sequelize.js`:

```javascript
// Current (default):
await connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
);

// Alternative options:

// 1. Different character set
await connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
   CHARACTER SET utf8 COLLATE utf8_general_ci`
);

// 2. With specific options
await connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci
   ENCRYPTION='N'`
);
```

### Disable Auto-Creation

If you want to disable auto-creation:

**Option 1: Modify `server.js`**
```javascript
// Change autoCreate parameter to false
const connected = await testConnection(false);
```

**Option 2: Use environment variable**

Add to `config/sequelize.js`:
```javascript
const autoCreate = process.env.AUTO_CREATE_DB !== 'false';
const connected = await testConnection(autoCreate);
```

Then in `.env`:
```env
AUTO_CREATE_DB=false
```

## Testing

### Test Auto-Creation

1. **Drop the database** (if it exists):
   ```bash
   mysql -u root -p -e "DROP DATABASE IF EXISTS marketplace_db;"
   ```

2. **Run the test script**:
   ```bash
   npm run test:db-creation
   ```

3. **Verify creation**:
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'marketplace_db';"
   ```

### Test Server Startup

1. **Drop the database**:
   ```bash
   mysql -u root -p -e "DROP DATABASE IF EXISTS marketplace_db;"
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Check logs** for:
   ```
   📦 Database 'marketplace_db' not found. Creating...
   ✅ Database 'marketplace_db' created successfully!
   ```

## Troubleshooting

### Issue: Database created but tables missing

**Cause:** Auto-creation only creates the database, not the tables.

**Solution:** Run the schema setup:
```bash
bash setup-database.sh
```

Or manually:
```bash
mysql -u root -p marketplace_db < database/schema.sql
```

### Issue: Permission denied on Windows

**Cause:** MySQL service running with restricted permissions.

**Solution:**
1. Run Command Prompt as Administrator
2. Or adjust MySQL service permissions
3. Or use a user with proper permissions

### Issue: Multiple databases created

**Cause:** Different database names in different environments.

**Solution:** Ensure consistent `DB_NAME` in `.env`:
```env
DB_NAME=marketplace_db
```

### Issue: Character encoding problems

**Cause:** Database created with wrong character set.

**Solution:** Recreate with correct encoding:
```bash
mysql -u root -p -e "DROP DATABASE marketplace_db;"
mysql -u root -p -e "CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Benefits

### Development
✅ **Quick Setup**: New developers can start immediately  
✅ **No Manual Steps**: Database created automatically  
✅ **Consistent Environment**: Same setup across all machines  
✅ **Error Prevention**: Prevents "database not found" errors  

### Testing
✅ **Clean State**: Easy to reset by dropping database  
✅ **Automated Tests**: CI/CD pipelines work without manual setup  
✅ **Isolation**: Each test environment can have its own database  

### Deployment
✅ **Simplified Deployment**: One less manual step  
✅ **Docker Friendly**: Works well in containerized environments  
✅ **Cloud Compatible**: Works with cloud MySQL services  

## Best Practices

1. **Development**: Use auto-creation freely
2. **Staging**: Pre-create database, but keep auto-creation as backup
3. **Production**: Always pre-create database manually
4. **Testing**: Use auto-creation for clean test environments
5. **CI/CD**: Enable auto-creation for automated pipelines

## Examples

### Docker Compose

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"
  
  app:
    build: .
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: rootpassword
      DB_NAME: marketplace_db
    depends_on:
      - mysql
```

The app will automatically create `marketplace_db` on first run.

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: testpassword
        ports:
          - 3306:3306
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Test database creation
        env:
          DB_HOST: 127.0.0.1
          DB_USER: root
          DB_PASSWORD: testpassword
          DB_NAME: test_db
        run: npm run test:db-creation
```

## Summary

The database auto-creation feature:
- ✅ Works on Linux, Windows, and macOS
- ✅ Prevents application crashes
- ✅ Simplifies development setup
- ✅ Provides helpful error messages
- ✅ Maintains security best practices
- ✅ Supports both development and production use cases

For questions or issues, refer to the troubleshooting section or check the error messages for helpful tips.
