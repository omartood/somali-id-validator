#!/usr/bin/env node

const ID = require('./src/index.js');

console.log('🧪 Testing Somali ID Validator Package\n');

// Test data
const validRecord = {
  idNumber: '934265782412',
  name: 'Ahmed Hassan Mohamed',
  sex: 'Male',
  dobDMY: '15-03-1990',
  issueDMY: '01-01-2020',
  expiryDMY: '01-01-2030'
};

const tests = [
  {
    name: '✅ Valid record validation',
    test: () => {
      const result = ID.validateRecord(validRecord);
      console.log('Result:', result);
      return result.ok === true;
    }
  },
  {
    name: '✅ ID masking',
    test: () => {
      const masked = ID.maskId('934265782412');
      console.log('Masked ID:', masked);
      return masked === '93*******412';
    }
  },
  {
    name: '✅ Record redaction',
    test: () => {
      const redacted = ID.redact(validRecord);
      console.log('Redacted:', redacted);
      return redacted.name === '[REDACTED]' && redacted.idNumber.includes('*');
    }
  },
  {
    name: '❌ Invalid ID number (too short)',
    test: () => {
      try {
        ID.validateRecord({ ...validRecord, idNumber: '12345' });
        return false;
      } catch (e) {
        console.log('Expected error:', e.message);
        return e.code === 'INVALID_ID_NUMBER';
      }
    }
  },
  {
    name: '❌ Invalid name (empty)',
    test: () => {
      try {
        ID.validateRecord({ ...validRecord, name: '' });
        return false;
      } catch (e) {
        console.log('Expected error:', e.message);
        return e.code === 'INVALID_NAME';
      }
    }
  },
  {
    name: '❌ Invalid sex',
    test: () => {
      try {
        ID.validateRecord({ ...validRecord, sex: 'Unknown' });
        return false;
      } catch (e) {
        console.log('Expected error:', e.message);
        return e.code === 'INVALID_SEX';
      }
    }
  },
  {
    name: '❌ Invalid date format',
    test: () => {
      try {
        ID.validateRecord({ ...validRecord, dobDMY: '1990/15/03' }); // Invalid: month > 12
        return false;
      } catch (e) {
        console.log('Expected error:', e.message);
        return e.code === 'INVALID_DATE';
      }
    }
  },
  {
    name: '❌ Inconsistent dates (expiry before issue)',
    test: () => {
      try {
        ID.validateRecord({ 
          ...validRecord, 
          issueDMY: '01-01-2025',
          expiryDMY: '01-01-2020'
        });
        return false;
      } catch (e) {
        console.log('Expected error:', e.message);
        return e.code === 'INCONSISTENT_DATES';
      }
    }
  }
];

// Run tests
let passed = 0;
let failed = 0;

for (const test of tests) {
  console.log(`\n🔍 ${test.name}`);
  try {
    const result = test.test();
    if (result) {
      console.log('✅ PASSED');
      passed++;
    } else {
      console.log('❌ FAILED');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED with error:', error.message);
    failed++;
  }
}

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('💥 Some tests failed!');
  process.exit(1);
}