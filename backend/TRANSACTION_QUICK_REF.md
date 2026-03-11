# Transaction Quick Reference

## Basic Pattern

```javascript
const { sequelize } = require('../config/sequelize');

const transaction = await sequelize.transaction();

try {
  // Your operations here
  await Model.create({...}, { transaction });
  await Model.update({...}, { transaction });
  
  await transaction.commit();
  return result;
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## Implemented Transactions

| Service/Model | Method | Operations | Status |
|--------------|--------|------------|--------|
| AuthService | register() | User + Profile creation | ✅ |
| OrderService | createOrder() | Order + Items creation | ✅ |
| DonationService | createDonation() | Donation + Product update | ✅ |
| Swap (wrapper) | accept() | Swap + Products lock | ✅ |
| Swap (wrapper) | cancel() | Swap + Products restore | ✅ |

## Quick Commands

```bash
# Test transactions
node backend/test-transactions.js

# Check transaction logs
# Look for "🔷 Transaction" in console output
```

## Common Patterns

### Service Layer
```javascript
static async myMethod(data) {
  const transaction = await sequelize.transaction();
  try {
    const result = await Model.create(data, { transaction });
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### Model Wrapper
```javascript
static async complexOp(id) {
  const transaction = await sequelize.transaction();
  try {
    const record = await Model.findByPk(id, { transaction });
    await record.update({...}, { transaction });
    await transaction.commit();
    return record.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

## Error Handling

```javascript
try {
  // Transaction code
} catch (error) {
  await transaction.rollback();
  
  // Use AppError for business logic errors
  if (error instanceof AppError) {
    throw error;
  }
  throw new AppError(error.message, 500);
}
```

## Testing Checklist

- [ ] Successful commit creates all records
- [ ] Rollback on error leaves no partial data
- [ ] AppError propagates correctly
- [ ] Related records updated atomically
- [ ] Concurrent transactions don't conflict

## Files

- `backend/config/sequelize.js` - Sequelize instance
- `backend/services/*.service.js` - Service implementations
- `backend/models/*.sequelize.wrapper.js` - Model wrappers
- `backend/test-transactions.js` - Test suite
- `backend/TRANSACTION_GUIDE.md` - Full documentation
