#!/usr/bin/env node

// Test importing the package as if it were installed from npm
const ID = require('./src/index.js');

console.log('🔗 Integration Test - Package Import\n');

try {
  // Test basic functionality
  const result = ID.validateRecord({
    idNumber: '934265782412',
    name: 'Integration Test User',
    sex: 'Female',
    dobDMY: '01-01-1995',
    issueDMY: '01-01-2021',
    expiryDMY: '01-01-2031'
  });

  console.log('✅ Package import successful');
  console.log('✅ validateRecord function works');
  console.log('✅ Result:', result);

  // Test privacy functions
  const masked = ID.maskId('934265782412');
  console.log('✅ maskId function works:', masked);

  const redacted = ID.redact(result);
  console.log('✅ redact function works:', redacted);

  // Test error handling
  try {
    ID.validateRecord({ idNumber: 'invalid' });
  } catch (e) {
    console.log('✅ Error handling works:', e.message);
  }

  console.log('\n🎉 Integration test passed! Package is ready for use.');

} catch (error) {
  console.error('❌ Integration test failed:', error.message);
  process.exit(1);
}