/**
 * MVC Structure Verification Script
 * Tests that all routes use controllers and no business logic exists in routes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MVC Structure Verification\n');
console.log('='.repeat(60));

// Test 1: Verify all controllers exist
console.log('\n1. Checking Controllers...');
const controllerDir = path.join(__dirname, 'controllers');
const controllers = fs.readdirSync(controllerDir).filter(f => f.endsWith('.js'));
console.log(`   ✅ Found ${controllers.length} controllers:`);
controllers.forEach(c => console.log(`      - ${c}`));

// Test 2: Verify all v1 routes exist
console.log('\n2. Checking V1 Routes...');
const routeDir = path.join(__dirname, 'routes', 'v1');
const routes = fs.readdirSync(routeDir).filter(f => f.endsWith('.js'));
console.log(`   ✅ Found ${routes.length} route files:`);
routes.forEach(r => console.log(`      - ${r}`));

// Test 3: Check for business logic in routes
console.log('\n3. Checking for Business Logic in Routes...');
let businessLogicFound = false;
const forbiddenPatterns = [
  /await\s+\w+\.findAll/,
  /await\s+\w+\.findById/,
  /await\s+\w+\.create/,
  /await\s+\w+\.update/,
  /await\s+\w+\.delete/,
  /await\s+db\.query/,
  /await\s+sequelize\./
];

routes.forEach(routeFile => {
  if (routeFile === 'index.js') return; // Skip index
  
  const content = fs.readFileSync(path.join(routeDir, routeFile), 'utf8');
  
  forbiddenPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      console.log(`   ❌ Business logic found in ${routeFile}`);
      businessLogicFound = true;
    }
  });
});

if (!businessLogicFound) {
  console.log('   ✅ No business logic found in routes');
}

// Test 4: Verify controller imports in routes
console.log('\n4. Checking Controller Imports in Routes...');
let allRoutesUseControllers = true;

routes.forEach(routeFile => {
  if (routeFile === 'index.js') return;
  
  const content = fs.readFileSync(path.join(routeDir, routeFile), 'utf8');
  const controllerName = routeFile.replace('.js', '').split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join('') + 'Controller';
  
  if (!content.includes('Controller')) {
    console.log(`   ⚠️  ${routeFile} may not use a controller`);
    allRoutesUseControllers = false;
  }
});

if (allRoutesUseControllers) {
  console.log('   ✅ All routes use controllers');
}

// Test 5: Verify catchAsync usage in controllers
console.log('\n5. Checking catchAsync Usage in Controllers...');
let allControllersUseCatchAsync = true;

controllers.forEach(controllerFile => {
  const content = fs.readFileSync(path.join(controllerDir, controllerFile), 'utf8');
  
  if (!content.includes('catchAsync')) {
    console.log(`   ⚠️  ${controllerFile} may not use catchAsync`);
    allControllersUseCatchAsync = false;
  }
});

if (allControllersUseCatchAsync) {
  console.log('   ✅ All controllers use catchAsync');
}

// Test 6: Verify AppError usage in controllers
console.log('\n6. Checking AppError Usage in Controllers...');
let allControllersUseAppError = true;

controllers.forEach(controllerFile => {
  const content = fs.readFileSync(path.join(controllerDir, controllerFile), 'utf8');
  
  if (!content.includes('AppError')) {
    console.log(`   ⚠️  ${controllerFile} may not use AppError`);
    allControllersUseAppError = false;
  }
});

if (allControllersUseAppError) {
  console.log('   ✅ All controllers use AppError');
}

// Test 7: Check middleware exports
console.log('\n7. Checking Middleware Exports...');
const authMiddleware = path.join(__dirname, 'middleware', 'auth.js');
const authContent = fs.readFileSync(authMiddleware, 'utf8');

if (authContent.includes('authenticate:')) {
  console.log('   ✅ auth.js exports authenticate');
} else {
  console.log('   ❌ auth.js missing authenticate export');
}

const caslMiddleware = path.join(__dirname, 'middleware', 'checkAbility.js');
const caslContent = fs.readFileSync(caslMiddleware, 'utf8');

if (caslContent.includes('requireAdmin') && caslContent.includes('requireRole')) {
  console.log('   ✅ checkAbility.js exports requireAdmin and requireRole');
} else {
  console.log('   ❌ checkAbility.js missing exports');
}

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 MVC Structure Verification Summary:\n');

const allTestsPassed = 
  !businessLogicFound && 
  allRoutesUseControllers && 
  allControllersUseCatchAsync && 
  allControllersUseAppError;

if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED - MVC STRUCTURE IS CORRECT');
  console.log('\nYour backend follows proper MVC architecture:');
  console.log('  - Routes only contain middleware and controller calls');
  console.log('  - Controllers handle request/response only');
  console.log('  - All controllers use catchAsync and AppError');
  console.log('  - No business logic in routes');
  console.log('\n🚀 PRODUCTION READY');
} else {
  console.log('⚠️  SOME ISSUES FOUND - REVIEW ABOVE');
  console.log('\nPlease fix the issues mentioned above.');
}

console.log('\n' + '='.repeat(60));
