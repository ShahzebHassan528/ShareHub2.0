/**
 * CASL Ability Definitions
 * Defines permissions for each role
 */

const { AbilityBuilder, Ability } = require('@casl/ability');

/**
 * Define abilities based on user role and data
 * @param {Object} user - User object with role and id
 * @returns {Ability} CASL Ability instance
 */
function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  if (!user) {
    // Anonymous users - read-only access
    can('read', 'Product');
    can('read', 'Category');
    return build();
  }

  // Common abilities for all authenticated users
  can('read', 'Product');
  can('read', 'Category');
  can('read', 'User', { id: user.id }); // Can read own profile
  can('update', 'User', { id: user.id }); // Can update own profile

  // Role-specific abilities
  switch (user.role) {
    case 'admin':
      // Admin can manage everything
      can('manage', 'all');
      break;

    case 'seller':
      // Seller abilities
      can('create', 'Product');
      can('read', 'Product'); // Can read all products
      can('update', 'Product', { seller_id: user.seller_id }); // Can update own products
      can('delete', 'Product', { seller_id: user.seller_id }); // Can delete own products
      
      can('read', 'Order'); // Can read orders for their products
      can('update', 'Order'); // Can update order status
      
      can('read', 'Review'); // Can read reviews
      can('reply', 'Review', { product: { seller_id: user.seller_id } }); // Can reply to reviews on own products
      
      can('read', 'Notification', { user_id: user.id });
      can('update', 'Notification', { user_id: user.id });
      break;

    case 'buyer':
      // Buyer abilities
      can('create', 'Order');
      can('read', 'Order', { buyer_id: user.id }); // Can read own orders
      can('update', 'Order', { buyer_id: user.id }); // Can cancel own orders
      
      can('create', 'Review');
      can('update', 'Review', { user_id: user.id }); // Can update own reviews
      can('delete', 'Review', { user_id: user.id }); // Can delete own reviews
      
      can('create', 'Donation');
      can('read', 'Donation', { donor_id: user.id }); // Can read own donations
      
      can('create', 'Swap');
      can('read', 'Swap', { requester_id: user.id }); // Can read own swap requests
      can('read', 'Swap', { owner_id: user.id }); // Can read swaps for own products
      can('update', 'Swap', { owner_id: user.id }); // Can accept/reject swaps
      can('cancel', 'Swap', { requester_id: user.id }); // Can cancel own swap requests
      
      can('read', 'Notification', { user_id: user.id });
      can('update', 'Notification', { user_id: user.id });
      break;

    case 'ngo':
      // NGO abilities
      can('read', 'Donation', { ngo_id: user.ngo_id }); // Can read donations to own NGO
      can('update', 'Donation', { ngo_id: user.ngo_id }); // Can accept/reject donations
      
      can('read', 'Notification', { user_id: user.id });
      can('update', 'Notification', { user_id: user.id });
      break;

    default:
      // Unknown role - minimal permissions
      break;
  }

  return build();
}

/**
 * Check if user can perform action on subject
 * @param {Object} user - User object
 * @param {string} action - Action to perform (create, read, update, delete, manage)
 * @param {string} subject - Subject type (Product, Order, etc.)
 * @param {Object} resource - Optional resource object for ownership checks
 * @returns {boolean} True if allowed
 */
function checkAbility(user, action, subject, resource = {}) {
  const ability = defineAbilitiesFor(user);
  return ability.can(action, subject, resource);
}

/**
 * Get all abilities for a user (for debugging/testing)
 * @param {Object} user - User object
 * @returns {Array} Array of rules
 */
function getUserAbilities(user) {
  const ability = defineAbilitiesFor(user);
  return ability.rules;
}

module.exports = {
  defineAbilitiesFor,
  checkAbility,
  getUserAbilities
};
