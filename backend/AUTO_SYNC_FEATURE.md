# Automatic Model Synchronization Feature

## Overview

Sequelize now automatically synchronizes models with the database during development. This creates tables if they don't exist, making setup even easier.

## How It Works

### Automatic Sync (Development)

When you start the server in development mode:

1. **Database Created**: If missing, database is created automatically
2. **Connection Established**: Sequelize connects to the database
3. **Models Synced**: Tables are created if they don't exist
4. **Server Ready**: Application starts normally

### Production Safety

In production (`NODE_ENV=production`):
- ✅ Database creation still works
- ✅ Connection established normally
- ❌ Model sync is **disabled** for safety
- ℹ️ Tables must be created manually or via migrations

## Sync Modes

### 1. Normal Sync (Default)

Creates tables if they don't exist. Safe for existing data.

```javascript
await sequelize.sync();
```

**Behavior:**
- ✅ Creates missing tables
- ✅ Preserves existing tables
- ✅ Preserves all data
- ❌ Doesn't update existing schema

**Use when:**
- First time setup
- Adding new models
- Safe for production (but disabled by default)

### 2. Alter Sync

Updates schema to match models. Use with caution.

```javascript
await sequelize.sync({ alter: true });
```

**Behavior:**
- ✅ Creates missing tables
- ✅ Adds missing columns
- ✅ Preserves existing data
- ⚠️ May modify column types
- ⚠️ May drop columns not in model

**Use when:**
- Updating model definitions
- Adding new fields
- Development only

**Warning:** Can cause data loss if columns are removed from models.

### 3. Force Sync

Drops and recreates all tables. **DESTROYS ALL DATA!**

```javascript
await sequelize.sync({ force: true });
```

**Behavior:**
- ❌ Drops all tables
- ✅ Creates fresh tables
- ❌ **DELETES ALL DATA**
- ❌ Disabled in production

**Use when:**
- Testing only
- Development reset
- **NEVER in production**

## Configuration

### Environment Variables

```env
# Set environment
NODE_ENV=development  # Enables sync
# NODE_ENV=production  # Disables sync

# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace_db
```

### Server Configuration

In `server.js`:

```javascript
const initOptions = {
  sync: true,      // Enable sync (auto-disabled in production)
  force: false,    // Never drop tables
  alter: false     // Don't alter schema automatically
};

await initializeDatabase(initOptions);
```

### Programmatic Usage

```javascript
const { syncModels, initializeDatabase } = require('./config/sequelize');

// Option 1: Full initialization with sync
await initializeDatabase({
  sync: true,
  force: false,
  alter: false
});

// Option 2: Just sync models
await syncModels({
  force: false,
  alter: false
});

// Option 3: Disable sync
await initializeDatabase({
  sync: false
});
```

## Usage

### Automatic (Recommended)

Just start your server:

```bash
npm run dev
```

**Output:**
```
🚀 Initializing database connection...
✅ Database 'marketplace_db' already exists.
✅ Sequelize: Database connection established successfully.
🔄 Synchronizing database models...
✅ Database models synchronized (tables created if missing)
✅ Database initialization complete!
✅ Sequelize ORM initialized successfully
```

### Manual Testing

Test sync functionality:

```bash
# Normal sync (creates missing tables)
npm run test:sync

# Alter sync (updates schema)
npm run sync:alter

# Force sync (drops and recreates - DELETES DATA!)
npm run sync:force
```

## Testing Commands

```bash
# Test normal sync
npm run test:sync

# Test with alter
npm run sync:alter

# Test with force (WARNING: deletes data!)
npm run sync:force

# Full Sequelize test (includes sync)
npm run test:sequelize

# Start development server (auto-sync enabled)
npm run dev
```

## Expected Output

### Development Mode

```
🚀 Initializing database connection...
🔍 Checking if database exists...
✅ Database 'marketplace_db' already exists.
✅ Sequelize: Database connection established successfully.
🔄 Synchronizing database models...
Executing (default): CREATE TABLE IF NOT EXISTS `users` (...)
Executing (default): CREATE TABLE IF NOT EXISTS `sellers` (...)
Executing (default): CREATE TABLE IF NOT EXISTS `products` (...)
✅ Database models synchronized (tables created if missing)
✅ Database initialization complete!
✅ Sequelize ORM initialized successfully
Server running on port 5000
Environment: development
```

### Production Mode

```
🚀 Initializing database connection...
✅ Database 'marketplace_db' already exists.
✅ Sequelize: Database connection established successfully.
ℹ️  Model sync disabled in production (as recommended)
✅ Database initialization complete!
✅ Sequelize ORM initialized successfully
Server running on port 5000
Environment: production
```

### Force Sync (Development Only)

```
🔄 Synchronizing database models...
⚠️  WARNING: Force sync will DROP all tables and recreate them!
⚠️  All data will be lost!
Executing (default): DROP TABLE IF EXISTS `users`
Executing (default): DROP TABLE IF EXISTS `sellers`
Executing (default): CREATE TABLE `users` (...)
Executing (default): CREATE TABLE `sellers` (...)
✅ Database models synchronized (FORCE - all tables recreated)
```

## Safety Features

### 1. Production Protection

```javascript
// Automatically disabled in production
if (process.env.NODE_ENV === 'production') {
  // Sync is skipped
  console.log('ℹ️  Model sync disabled in production');
}
```

### 2. Force Sync Protection

```javascript
// Force sync blocked in production
if (!isDevelopment && forceSync) {
  console.error('❌ CRITICAL: Force sync is disabled in production!');
  return false;
}
```

### 3. Warning Messages

```javascript
if (forceSync) {
  console.warn('⚠️  WARNING: Force sync will DROP all tables!');
  console.warn('⚠️  All data will be lost!');
}
```

## Tables Created

When sync runs, these tables are created:

1. **users** - User accounts
2. **sellers** - Seller profiles
3. **ngos** - NGO profiles
4. **categories** - Product categories
5. **products** - Product listings
6. **product_images** - Product images
7. **orders** - Customer orders
8. **order_items** - Order line items
9. **donations** - Donation records
10. **product_swaps** - Product swap requests
11. **reviews** - Product reviews
12. **admin_logs** - Admin activity logs
13. **notifications** - User notifications

## Schema Details

### Character Set
- **Charset**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Supports**: Emojis, international characters

### Timestamps
- **created_at**: Automatically added
- **updated_at**: Automatically updated (where applicable)

### Indexes
- Primary keys on all tables
- Foreign key indexes
- Search indexes on frequently queried columns

## Best Practices

### Development

✅ **Enable sync**: Let Sequelize create tables  
✅ **Use normal sync**: Safe for existing data  
✅ **Test with force**: Reset database when needed  
✅ **Use alter carefully**: Can modify schema  

### Staging

⚠️ **Use migrations**: More controlled than sync  
⚠️ **Test sync first**: In separate environment  
⚠️ **Backup data**: Before using alter  
❌ **Avoid force**: Never drop production-like data  

### Production

❌ **Disable sync**: Use migrations instead  
❌ **Never force**: Would delete all data  
❌ **Never alter**: Could break application  
✅ **Manual control**: Use migration scripts  

## Comparison with Migrations

### Sync (Current Approach)

**Pros:**
- ✅ Automatic
- ✅ Fast setup
- ✅ Good for development
- ✅ No migration files needed

**Cons:**
- ❌ Less control
- ❌ Can't rollback
- ❌ Not recommended for production
- ❌ No version history

### Migrations (Future Enhancement)

**Pros:**
- ✅ Full control
- ✅ Can rollback
- ✅ Production-safe
- ✅ Version history
- ✅ Team collaboration

**Cons:**
- ❌ Manual setup
- ❌ More complex
- ❌ Requires planning

**Recommendation:** Use sync for development, migrations for production.

## Troubleshooting

### Issue: Tables not created

**Cause:** Sync disabled or failed

**Solution:**
```bash
# Check environment
echo $NODE_ENV  # Should be 'development' or empty

# Run sync test
npm run test:sync

# Check logs for errors
```

### Issue: Schema mismatch

**Cause:** Model definitions don't match database

**Solution:**
```bash
# Option 1: Alter sync (updates schema)
npm run sync:alter

# Option 2: Force sync (recreates tables - DELETES DATA!)
npm run sync:force

# Option 3: Manual fix
mysql -u root -p marketplace_db
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
```

### Issue: Sync fails in production

**Cause:** Sync is disabled in production (by design)

**Solution:**
```bash
# This is correct behavior!
# Use migrations or manual SQL for production

# If you really need sync in production (not recommended):
NODE_ENV=development npm start
```

### Issue: Foreign key errors

**Cause:** Tables created in wrong order

**Solution:**
```bash
# Force sync recreates in correct order
npm run sync:force

# Or drop all tables and sync again
mysql -u root -p -e "DROP DATABASE marketplace_db;"
npm run dev
```

### Issue: Data lost after sync

**Cause:** Force sync was used

**Solution:**
```bash
# Restore from backup
mysql -u root -p marketplace_db < backup.sql

# Or reseed data
bash setup-database.sh
```

## Migration Path

### Current: Sync-based (Development)

```
1. Start server
2. Sync creates tables
3. Manually seed data
4. Develop features
```

### Future: Migration-based (Production)

```
1. Create migration files
2. Run migrations
3. Version control
4. Deploy safely
```

### Transition Plan

1. **Phase 1** (Current): Use sync for development
2. **Phase 2**: Create initial migration from current schema
3. **Phase 3**: Use migrations for new changes
4. **Phase 4**: Disable sync, use migrations only

## Advanced Configuration

### Custom Sync Options

```javascript
// In server.js or custom script
const initOptions = {
  sync: true,
  force: false,
  alter: false,
  
  // Additional Sequelize sync options
  logging: console.log,
  hooks: true,
  schema: 'public'
};

await initializeDatabase(initOptions);
```

### Conditional Sync

```javascript
// Sync only specific models
const { User, Product } = require('./database/models');

await User.sync();
await Product.sync();
```

### Sync with Hooks

```javascript
// Run code before/after sync
sequelize.beforeSync(() => {
  console.log('About to sync...');
});

sequelize.afterSync(() => {
  console.log('Sync complete!');
});

await sequelize.sync();
```

## Security Considerations

### 1. Environment Separation

```env
# Development
NODE_ENV=development
ENABLE_SYNC=true

# Production
NODE_ENV=production
ENABLE_SYNC=false
```

### 2. User Permissions

```sql
-- Development user (can create tables)
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'dev_user'@'localhost';

-- Production user (no CREATE/DROP)
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_db.* TO 'prod_user'@'localhost';
```

### 3. Backup Before Sync

```bash
# Always backup before alter or force sync
mysqldump -u root -p marketplace_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Then run sync
npm run sync:alter
```

## Examples

### Example 1: Fresh Setup

```bash
# Clone repository
git clone <repo>
cd project123/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start server (auto-creates database and tables)
npm run dev
```

### Example 2: Reset Database

```bash
# Drop database
mysql -u root -p -e "DROP DATABASE marketplace_db;"

# Start server (recreates everything)
npm run dev
```

### Example 3: Update Schema

```javascript
// 1. Update model
// In User.sequelize.js, add new field:
new_field: {
  type: DataTypes.STRING(100),
  allowNull: true
}

// 2. Run alter sync
npm run sync:alter

// 3. Verify
mysql -u root -p marketplace_db
DESCRIBE users;
```

### Example 4: CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: testpass
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test:sync
        env:
          NODE_ENV: development
          DB_PASSWORD: testpass
```

## Summary

The automatic sync feature:

✅ **Simplifies development** - No manual table creation  
✅ **Safe by default** - Preserves existing data  
✅ **Production-safe** - Disabled in production  
✅ **Flexible** - Multiple sync modes  
✅ **Well-tested** - Comprehensive test scripts  
✅ **Documented** - Clear usage guidelines  

For production deployments, consider using Sequelize migrations for better control and version management.
