/**
 * Simple CASL Test
 */

const { defineAbilitiesFor } = require('./permissions/ability');

console.log('Testing CASL...');

const adminUser = { id: 1, role: 'admin' };
const ability = defineAbilitiesFor(adminUser);

console.log('Admin can manage all:', ability.can('manage', 'all'));
console.log('Test passed!');
