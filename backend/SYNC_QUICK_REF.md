# Model Sync - Quick Reference

## What It Does

Automatically creates database tables from Sequelize models during development.

## Quick Start

```bash
# Start server (auto-sync enabled in development)
npm run dev
```

Tables are created automatically!

## Test Commands

```bash
# Test sync (creates missing tables)
npm run test:sync

# Update schema (adds/modifies columns)
npm run sync:alter

# Reset database (DELETES ALL DATA!)
npm run sync:force
```

## Sync Modes

| Mode | Command | Creates Tables | Updates Schema | Deletes Data |
|------|---------|----------------|----------------|--------------|
| **Normal** | `npm run test:sync` | ✅ | ❌ | ❌ |
| **Alter** | `npm run sync:alter` | ✅ | ✅ | ⚠️ Maybe |
| **Force** | `npm run sync:force` | ✅ | ✅ | ❌ YES! |

## Environment Behavior

### Development (Default)
```bash
NODE_ENV=development npm run dev
```
- ✅ Sync enabled
- ✅ Creates tables automatically
- ✅ Safe for existing data

### Production
```bash
NODE_ENV=production npm start
```
- ❌ Sync disabled
- ℹ️ Tables must exist
- ✅ Safe - no schema changes

## Expected Output

### Development Start
```
🚀 Initializing database connection...
✅ Database 'marketplace_db' already exists.
🔄 Synchronizing database models...
✅ Database models synchronized (tables created if missing)
✅ Sequelize ORM initialized successfully
```

### Production Start
```
🚀 Initializing database connection...
✅ Database 'marketplace_db' already exists.
ℹ️  Model sync disabled in production (as recommended)
✅ Sequelize ORM initialized successfully
```

## Tables Created

When sync runs, 13 tables are created:
- users
- sellers
- ngos
- categories
- products
- product_images
- orders
- order_items
- donations
- product_swaps
- reviews
- admin_logs
- notifications

## Configuration

### Enable/Disable Sync

In `server.js`:
```javascript
const initOptions = {
  sync: true,      // Enable sync
  force: false,    // Don't drop tables
  alter: false     // Don't alter schema
};
```

### Environment Variable
```env
NODE_ENV=development  # Sync enabled
NODE_ENV=production   # Sync disabled
```

## Common Tasks

### First Time Setup
```bash
npm install
npm run dev  # Creates database and tables
```

### Add New Model
```javascript
// 1. Create model file
// 2. Add to database/models/index.js
// 3. Restart server
npm run dev  # New table created automatically
```

### Update Existing Model
```javascript
// 1. Modify model definition
// 2. Run alter sync
npm run sync:alter
```

### Reset Database
```bash
# WARNING: Deletes all data!
npm run sync:force
```

## Safety Rules

### ✅ Safe Operations
- Normal sync in development
- Testing with test database
- Backing up before alter/force

### ⚠️ Use with Caution
- Alter sync (can modify columns)
- Force sync in development (deletes data)
- Sync in staging environment

### ❌ Never Do
- Force sync in production
- Sync in production without testing
- Alter sync without backup

## Troubleshooting

### Tables Not Created
```bash
# Check environment
echo $NODE_ENV  # Should be empty or 'development'

# Run sync test
npm run test:sync
```

### Schema Mismatch
```bash
# Update schema
npm run sync:alter

# Or reset (DELETES DATA!)
npm run sync:force
```

### Sync Disabled Message
```
ℹ️  Model sync disabled in production
```
This is correct! Use migrations in production.

## Quick Comparison

### Sync vs Manual SQL

**Sync (Automatic):**
```bash
npm run dev
# Tables created automatically
```

**Manual SQL:**
```bash
mysql -u root -p marketplace_db < database/schema.sql
```

### Sync vs Migrations

**Sync:**
- ✅ Automatic
- ✅ Fast
- ❌ No version control
- ❌ Can't rollback

**Migrations:**
- ✅ Version control
- ✅ Can rollback
- ❌ Manual setup
- ✅ Production-safe

## Best Practices

### Development
✅ Use normal sync  
✅ Test with force sync  
✅ Backup before alter  

### Production
❌ Disable sync  
✅ Use migrations  
✅ Manual control  

## More Information

See `AUTO_SYNC_FEATURE.md` for comprehensive documentation.
