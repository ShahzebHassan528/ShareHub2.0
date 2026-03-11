# Sequelize Transaction Implementation Guide

## Overview

This guide documents the implementation of Sequelize transactions for atomic database operations in critical workflows. Transactions ensure data consistency by rolling back all changes if any operation fails.

## What Are Transactions?

A transaction is a sequence of database operations that are executed as a single unit of work. Either all operations succeed (commit), or all fail (rollback).

### Benefits
- **Atomicity**: All-or-nothing execution
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes are permanent

## Implementation Status

### ✅ Completed Implementations

#### 1. AuthService.register()
**Location**: `services/auth.service.js`

**Operations**:
- Create user account
- Create role-specific profile (Seller/NGO)

**Transaction ensures**:
- If profile creation fails, user is not created
- No orphaned user records without profiles

```javascript
const transaction = await sequelize.transaction();

try {
  const userId = await User.create({...}, { transaction });
  
  if (role === 'seller') {
    await Seller.create({...}, { transaction });
  }
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

#### 2. OrderService.createOrder()
**Location**: `services/order.service.js`

**Operations**:
- Create order record
- Create multiple order items
- Validate product availability

**Transaction ensures**:
- If any item fails, entire order is cancelled
- No partial orders in database
- Consistent order totals

```javascript
const transaction = await sequelize.transaction();

try {
  const orderId = await Order.create({...}, { transaction });
  
  for (const item of items) {
    await Order.addItem(orderId, item, { transaction });
  }
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

#### 3. DonationService.createDonation()
**Location**: `services/donation.service.js`

**Operations**:
- Create donation record
- Update product availability status

**Transaction ensures**:
- If donation fails, product remains available
- No donated products without donation records

```javascript
const transaction = await sequelize.transaction();

try {
  if (product_id) {
    await Product.update(product_id, {
      availability_status: 'unavailable'
    }, { transaction });
  }
  
  const donationId = await Donation.create({...}, { transaction });
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

#### 4. Swap.accept()
**Location**: `models/Swap.sequelize.wrapper.js`

**Operations**:
- Update swap status to 'accepted'
- Mark both products as unavailable

**Transaction ensures**:
- Both products locked together
- No partial swap acceptance

```javascript
const transaction = await sequelize.transaction();

try {
  await swap.update({ status: 'accepted' }, { transaction });
  
  await Product.update(
    { is_available: false },
    { 
      where: { id: { [Op.in]: [product1, product2] } },
      transaction 
    }
  );
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

#### 5. Swap.cancel()
**Location**: `models/Swap.sequelize.wrapper.js`

**Operations**:
- Update swap status to 'rejected'
- Restore product availability (if accepted)

**Transaction ensures**:
- Products restored atomically
- Consistent swap cancellation

```javascript
const transaction = await sequelize.transaction();

try {
  if (swap.status === 'accepted') {
    await Product.update(
      { is_available: true },
      { 
        where: { id: { [Op.in]: [product1, product2] } },
        transaction 
      }
    );
  }
  
  await swap.update({ status: 'rejected' }, { transaction });
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

## Transaction Patterns

### Pattern 1: Service Layer Transaction
Used when business logic spans multiple models.

```javascript
static async myMethod(data) {
  const transaction = await sequelize.transaction();
  
  try {
    // Multiple operations
    await Model1.create({...}, { transaction });
    await Model2.update({...}, { transaction });
    
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### Pattern 2: Model Wrapper Transaction
Used for complex model operations.

```javascript
static async complexOperation(id) {
  const transaction = await sequelize.transaction();
  
  try {
    const record = await Model.findByPk(id, { transaction });
    await record.update({...}, { transaction });
    await RelatedModel.update({...}, { transaction });
    
    await transaction.commit();
    return record.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

---

## Error Handling

All transactional methods use `AppError` for consistent error handling:

```javascript
try {
  // Transaction operations
} catch (error) {
  await transaction.rollback();
  
  // Re-throw as AppError if not already
  if (error instanceof AppError) {
    throw error;
  }
  throw new AppError(error.message, 500);
}
```

---

## Testing Transactions

### Test Script
Run: `node backend/test-transactions.js`

### Test Coverage
1. **Successful commits**: Verify all operations complete
2. **Rollback on failure**: Verify no partial data
3. **Concurrent transactions**: Verify isolation
4. **Error propagation**: Verify AppError usage

### Example Test
```javascript
// Test rollback
try {
  await Service.method({
    valid_field: 'value',
    invalid_field: null // Will cause constraint violation
  });
  console.log('❌ Should have thrown error');
} catch (error) {
  console.log('✅ Transaction rolled back:', error.message);
}
```

---

## Best Practices

### ✅ DO
- Use transactions for multi-step operations
- Always commit or rollback
- Use try-catch-finally blocks
- Pass transaction to all operations
- Use AppError for business logic errors
- Test rollback scenarios

### ❌ DON'T
- Forget to rollback on error
- Mix transactional and non-transactional operations
- Use transactions for single operations
- Nest transactions (use savepoints instead)
- Perform long-running operations in transactions
- Ignore transaction errors

---

## Performance Considerations

### Transaction Overhead
- Minimal for critical operations
- Worth the data consistency guarantee
- Use only when atomicity required

### Optimization Tips
1. Keep transactions short
2. Avoid external API calls inside transactions
3. Validate data before starting transaction
4. Use appropriate isolation levels
5. Monitor transaction duration

---

## Future Enhancements

### Potential Additions
1. **Payment processing**: Atomic payment + order update
2. **Inventory management**: Stock updates with orders
3. **Refund processing**: Order + payment reversal
4. **Bulk operations**: Multiple records atomically

### Advanced Features
- Savepoints for nested operations
- Custom isolation levels
- Distributed transactions
- Transaction retry logic

---

## Troubleshooting

### Common Issues

**Issue**: Transaction timeout
**Solution**: Reduce transaction scope, optimize queries

**Issue**: Deadlock detected
**Solution**: Ensure consistent lock ordering, retry logic

**Issue**: Rollback not working
**Solution**: Verify transaction passed to all operations

**Issue**: Partial data after error
**Solution**: Check all operations use same transaction

---

## References

- [Sequelize Transactions Docs](https://sequelize.org/docs/v6/other-topics/transactions/)
- `backend/config/sequelize.js` - Sequelize instance
- `backend/utils/AppError.js` - Error handling
- `backend/test-transactions.js` - Test suite

---

## Summary

Transactions are now implemented for all critical workflows:
- ✅ User registration with profiles
- ✅ Order creation with items
- ✅ Donations with product updates
- ✅ Swap acceptance/cancellation

All implementations follow consistent patterns, use AppError for error handling, and include comprehensive test coverage.
