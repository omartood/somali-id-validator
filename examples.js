#!/usr/bin/env node

/**
 * Somali ID Validator - Usage Examples
 * Run with: node examples.js
 */

const ID = require('./src/index.js');

console.log('🇸🇴 Somali ID Validator - Usage Examples\n');

// Example 1: Valid ID Validation
console.log('📋 Example 1: Valid ID Validation');
console.log('=====================================');
try {
  const validRecord = {
    idNumber: '934265782412',
    name: 'Ahmed Hassan Mohamed',
    sex: 'Male',
    dobDMY: '15-03-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2030'
  };
  
  const result = ID.validateRecord(validRecord);
  console.log('✅ Validation successful!');
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('❌ Validation failed:', error.message);
}

console.log('\n');

// Example 2: Privacy Features
console.log('🔒 Example 2: Privacy Features');
console.log('==============================');
const sensitiveId = '934265782412';
const sensitiveRecord = {
  idNumber: '934265782412',
  name: 'Fatima Ali Hassan',
  sex: 'Female',
  dobDMY: '20-05-1985'
};

console.log('Original ID:', sensitiveId);
console.log('Masked ID:', ID.maskId(sensitiveId));
console.log('Custom Mask:', ID.maskId(sensitiveId, { head: 3, tail: 2 }));
console.log('\nOriginal Record:', sensitiveRecord);
console.log('Redacted Record:', ID.redact(sensitiveRecord));

console.log('\n');

// Example 3: Bilingual Error Messages
console.log('🌍 Example 3: Bilingual Error Messages');
console.log('======================================');

const errorExamples = [
  {
    name: 'Invalid ID Number',
    data: { idNumber: '12345', name: 'Ahmed', sex: 'Male', dobDMY: '01-01-1990', issueDMY: '01-01-2020', expiryDMY: '01-01-2030' }
  },
  {
    name: 'Invalid Name',
    data: { idNumber: '934265782412', name: '', sex: 'Male', dobDMY: '01-01-1990', issueDMY: '01-01-2020', expiryDMY: '01-01-2030' }
  },
  {
    name: 'Invalid Gender',
    data: { idNumber: '934265782412', name: 'Ahmed Hassan', sex: 'Unknown', dobDMY: '01-01-1990', issueDMY: '01-01-2020', expiryDMY: '01-01-2030' }
  }
];

errorExamples.forEach((example, index) => {
  console.log(`\n${index + 1}. ${example.name}:`);
  try {
    ID.validateRecord(example.data);
  } catch (error) {
    console.log(`   English: ${error.message}`);
    console.log(`   Somali:  ${error.somaliMessage}`);
    console.log(`   Code:    ${error.code}`);
  }
});

console.log('\n');

// Example 4: Custom Validation Rules
console.log('⚙️  Example 4: Custom Validation Rules');
console.log('=====================================');

const customRules = {
  idNumber: {
    length: 10,        // Require 10 digits instead of 12
    mustStart: "93",   // Must start with "93"
    allowSpaces: false
  },
  nameMaxLen: 50,      // Shorter name limit
  allowArabic: false,  // Only Latin characters
  requireFutureExpiry: false
};

console.log('Custom Rules:', JSON.stringify(customRules, null, 2));

try {
  const result = ID.validateRecord({
    idNumber: '9312345678',  // 10 digits starting with 93
    name: 'Ahmed Hassan',
    sex: 'Male',
    dobDMY: '01-01-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2025'
  }, customRules);
  
  console.log('✅ Custom validation successful!');
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('❌ Custom validation failed:');
  console.log(`   English: ${error.message}`);
  console.log(`   Somali:  ${error.somaliMessage}`);
}

console.log('\n');

// Example 5: Available Error Messages
console.log('📚 Example 5: Available Error Messages');
console.log('=====================================');
console.log('All available Somali error messages:');
Object.entries(ID.SOMALI_MESSAGES).forEach(([code, message]) => {
  console.log(`${code}: ${message}`);
});

console.log('\n🎉 Examples completed! Check the README.md for more details.');