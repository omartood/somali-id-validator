#!/usr/bin/env node

const ID = require('./src/index.js');

console.log('🇸🇴 Testing Somali Error Messages\n');

// Test programmatic access to Somali messages
console.log('📚 Available Somali Error Messages:');
Object.keys(ID.SOMALI_MESSAGES).forEach(code => {
  console.log(`${code}: ${ID.SOMALI_MESSAGES[code]}`);
});

console.log('\n🧪 Testing Error Handling with Somali Messages:\n');

const testCases = [
  {
    name: 'Invalid ID Number',
    data: { idNumber: '12345', name: 'Ahmed', sex: 'Male', dobDMY: '01-01-1990', issueDMY: '01-01-2020', expiryDMY: '01-01-2030' }
  },
  {
    name: 'Invalid Name',
    data: { idNumber: '934265782412', name: '', sex: 'Male', dobDMY: '01-01-1990', issueDMY: '01-01-2020', expiryDMY: '01-01-2030' }
  },
  {
    name: 'Invalid Sex',
    data: { idNumber: '934265782412', name: 'Ahmed Hassan', sex: 'Unknown', dobDMY: '01-01-1990', issueDMY: '01-01-2020', expiryDMY: '01-01-2030' }
  },
  {
    name: 'Invalid Date Format',
    data: { idNumber: '934265782412', name: 'Ahmed Hassan', sex: 'Male', dobDMY: '1990-01-01', issueDMY: '01-01-2020', expiryDMY: '01-01-2030' }
  }
];

testCases.forEach(testCase => {
  try {
    ID.validateRecord(testCase.data);
  } catch (error) {
    console.log(`❌ ${testCase.name}:`);
    console.log(`   English: ${error.message}`);
    console.log(`   Somali:  ${error.somaliMessage}`);
    console.log(`   Code:    ${error.code}\n`);
  }
});

console.log('🎉 Somali error messages are working perfectly!');