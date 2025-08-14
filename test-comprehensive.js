#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Somali ID Validator v0.2.0
 * Tests all features including legacy compatibility
 */

const ID = require('./src/index.js');

console.log('🧪 Comprehensive Test Suite - Somali ID Validator v0.2.0\n');

let passed = 0;
let failed = 0;

function runTest(name, testFn) {
  console.log(`🔍 ${name}`);
  try {
    const result = testFn();
    if (result) {
      console.log('✅ PASSED\n');
      passed++;
    } else {
      console.log('❌ FAILED\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failed++;
  }
}

// ========================================
// CORE VALIDATION TESTS
// ========================================

runTest('Core - Valid Record Validation', () => {
  const validRecord = {
    idNumber: '934265782412',
    name: 'Ahmed Hassan Mohamed',
    sex: 'Male',
    dobDMY: '15-03-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2030'
  };
  
  const result = ID.validateRecord(validRecord);
  
  if (!result.ok || result.idNumber !== '934265782412' || result.name !== 'Ahmed Hassan Mohamed') {
    console.log('Invalid result structure');
    return false;
  }
  
  console.log('Valid record processed successfully');
  return true;
});

runTest('Core - ID Number Validation', () => {
  // Valid ID
  const validId = ID.validateIdNumber('934265782412');
  if (validId !== '934265782412') {
    console.log('Valid ID validation failed');
    return false;
  }
  
  // Invalid ID (too short)
  try {
    ID.validateIdNumber('12345');
    return false;
  } catch (error) {
    if (error.code !== 'INVALID_ID_NUMBER') {
      console.log('Wrong error code for invalid ID');
      return false;
    }
  }
  
  console.log('ID number validation working correctly');
  return true;
});

runTest('Core - Name Validation', () => {
  // Valid names
  const validName1 = ID.validateName('Ahmed Hassan Mohamed');
  const validName2 = ID.validateName('أحمد حسن محمد'); // Arabic
  
  if (validName1 !== 'Ahmed Hassan Mohamed') {
    console.log('English name validation failed');
    return false;
  }
  
  if (validName2 !== 'أحمد حسن محمد') {
    console.log('Arabic name validation failed');
    return false;
  }
  
  // Invalid name (empty)
  try {
    ID.validateName('');
    return false;
  } catch (error) {
    if (error.code !== 'INVALID_NAME') {
      console.log('Wrong error code for empty name');
      return false;
    }
  }
  
  console.log('Name validation working correctly');
  return true;
});

runTest('Core - Sex Validation', () => {
  // Valid sex values
  if (ID.validateSex('Male') !== 'Male') return false;
  if (ID.validateSex('Female') !== 'Female') return false;
  if (ID.validateSex('M') !== 'Male') return false;
  if (ID.validateSex('F') !== 'Female') return false;
  if (ID.validateSex('male') !== 'Male') return false;
  if (ID.validateSex('female') !== 'Female') return false;
  
  // Invalid sex
  try {
    ID.validateSex('Unknown');
    return false;
  } catch (error) {
    if (error.code !== 'INVALID_SEX') {
      console.log('Wrong error code for invalid sex');
      return false;
    }
  }
  
  console.log('Sex validation working correctly');
  return true;
});

// ========================================
// ENHANCED DATE FORMAT TESTS (v0.2.0)
// ========================================

runTest('Enhanced Dates - Multiple Format Support', () => {
  const testCases = [
    { input: '15-03-1990', expected: { dd: 15, mm: 3, yyyy: 1990, format: 'dd-mm-yyyy' } },
    { input: '15/03/1990', expected: { dd: 15, mm: 3, yyyy: 1990, format: 'dd/mm/yyyy' } },
    { input: '1990-03-15', expected: { dd: 15, mm: 3, yyyy: 1990, format: 'yyyy-mm-dd' } },
    { input: '15.03.1990', expected: { dd: 15, mm: 3, yyyy: 1990, format: 'dd.mm.yyyy' } }
  ];
  
  for (const testCase of testCases) {
    const parsed = ID.parseDate(testCase.input);
    if (!parsed || 
        parsed.dd !== testCase.expected.dd || 
        parsed.mm !== testCase.expected.mm || 
        parsed.yyyy !== testCase.expected.yyyy ||
        parsed.format !== testCase.expected.format) {
      console.log(`Failed to parse ${testCase.input}`);
      return false;
    }
    
    if (!ID.isValidDate(testCase.input)) {
      console.log(`Date validation failed for ${testCase.input}`);
      return false;
    }
    
    const iso = ID.toISOFromDate(testCase.input);
    if (!iso.includes('1990-03-15')) {
      console.log(`ISO conversion failed for ${testCase.input}: ${iso}`);
      return false;
    }
  }
  
  console.log('All date formats working correctly');
  return true;
});

runTest('Enhanced Dates - Invalid Format Handling', () => {
  const invalidDates = [
    '32-01-1990',  // Invalid day
    '01-13-1990',  // Invalid month
    '1990/15/03',  // Invalid format
    '15-03-1800',  // Year too old
    'invalid-date',
    '15-03',       // Incomplete
    ''
  ];
  
  for (const invalidDate of invalidDates) {
    if (ID.isValidDate(invalidDate)) {
      console.log(`Should have rejected: ${invalidDate}`);
      return false;
    }
    
    const parsed = ID.parseDate(invalidDate);
    // Note: parseDate may parse format but isValidDate should catch logical errors
    if (parsed && ID.isValidDate(invalidDate)) {
      console.log(`Should not have validated: ${invalidDate}`);
      return false;
    }
  }
  
  console.log('Invalid date handling working correctly');
  return true;
});

runTest('Enhanced Dates - Mixed Format Validation', () => {
  const mixedRecord = {
    idNumber: '934265782412',
    name: 'Ahmed Hassan',
    sex: 'Male',
    dobDMY: '1990-03-15',    // yyyy-mm-dd
    issueDMY: '01/01/2020',  // dd/mm/yyyy
    expiryDMY: '01.01.2030'  // dd.mm.yyyy
  };
  
  const result = ID.validateRecord(mixedRecord);
  
  if (!result.ok) {
    console.log('Mixed format validation failed');
    return false;
  }
  
  if (!result.dobISO.includes('1990-03-15') ||
      !result.issueISO.includes('2020-01-01') ||
      !result.expiryISO.includes('2030-01-01')) {
    console.log('Date conversion failed');
    return false;
  }
  
  console.log('Mixed date formats working correctly');
  return true;
});

// ========================================
// TRILINGUAL SUPPORT TESTS (v0.2.0)
// ========================================

runTest('Trilingual - Arabic Language Support', () => {
  try {
    ID.validateRecord({
      idNumber: '12345', // Invalid
      name: 'أحمد حسن',
      sex: 'Male',
      dobDMY: '01-01-1990',
      issueDMY: '01-01-2020',
      expiryDMY: '01-01-2030'
    });
    return false;
  } catch (error) {
    if (!error.arabicMessage || !error.arabicMessage.includes('رقم الهوية')) {
      console.log(`Missing or wrong Arabic message: ${error.arabicMessage}`);
      return false;
    }
    
    if (!error.somaliMessage || !error.somaliMessage.includes('Lambarka')) {
      console.log(`Missing Somali message: ${error.somaliMessage}`);
      return false;
    }
    
    console.log(`Arabic error: ${error.arabicMessage}`);
    console.log(`Somali error: ${error.somaliMessage}`);
    return true;
  }
});

runTest('Trilingual - Multilingual Validation Function', () => {
  try {
    ID.validateRecordMultilingual({
      idNumber: '934265782412', // Valid ID
      name: 'فاطمة علي',
      sex: 'Unknown', // This will trigger error
      dobDMY: '01-01-1990',
      issueDMY: '01-01-2020',
      expiryDMY: '01-01-2030'
    }, ID.DEFAULT_RULE, 'ar');
    return false;
  } catch (error) {
    if (!error.localizedMessage || !error.localizedMessage.includes('الجنس')) {
      console.log(`Wrong localized message: ${error.localizedMessage}`);
      return false;
    }
    
    if (!error.arabicMessage || !error.somaliMessage) {
      console.log('Missing language messages');
      return false;
    }
    
    console.log(`Localized Arabic: ${error.localizedMessage}`);
    return true;
  }
});

runTest('Trilingual - Language Constants', () => {
  const languages = ID.SUPPORTED_LANGUAGES;
  
  if (!languages.en || !languages.so || !languages.ar) {
    console.log('Missing supported languages');
    return false;
  }
  
  if (languages.en !== 'English' || 
      languages.so !== 'Somali' || 
      languages.ar !== 'Arabic') {
    console.log('Wrong language names');
    return false;
  }
  
  // Test message retrieval
  const arabicMsg = ID.getLocalizedMessage('INVALID_ID_NUMBER', 'ar');
  const somaliMsg = ID.getLocalizedMessage('INVALID_ID_NUMBER', 'so');
  
  if (!arabicMsg || !arabicMsg.includes('رقم الهوية')) {
    console.log('Arabic message retrieval failed');
    return false;
  }
  
  if (!somaliMsg || !somaliMsg.includes('Lambarka')) {
    console.log('Somali message retrieval failed');
    return false;
  }
  
  console.log('Language support working correctly');
  return true;
});

// ========================================
// PERFORMANCE TESTS (v0.2.0)
// ========================================

runTest('Performance - Fast Validation', () => {
  const validRecord = {
    idNumber: '934265782412',
    name: 'Ahmed Hassan Mohamed',
    sex: 'Male',
    dobDMY: '15-03-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2030'
  };
  
  // Test performance
  const iterations = 100;
  const start = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    ID.validateRecordFast(validRecord);
  }
  
  const end = Date.now();
  const avgTime = (end - start) / iterations;
  
  console.log(`Average validation time: ${avgTime.toFixed(2)}ms`);
  
  // Should be under 10ms per validation
  if (avgTime > 10) {
    console.log('Performance too slow');
    return false;
  }
  
  // Test error handling
  try {
    ID.validateRecordFast(null);
    return false;
  } catch (error) {
    if (error.code !== 'INVALID_INPUT') {
      console.log('Wrong error for null input');
      return false;
    }
  }
  
  try {
    ID.validateRecordFast({});
    return false;
  } catch (error) {
    if (error.code !== 'MISSING_FIELD') {
      console.log('Wrong error for missing fields');
      return false;
    }
  }
  
  return true;
});

runTest('Performance - Batch Processing', () => {
  const records = [
    {
      idNumber: '934265782412',
      name: 'Ahmed Hassan',
      sex: 'Male',
      dobDMY: '15-03-1990',
      issueDMY: '01-01-2020',
      expiryDMY: '01-01-2030'
    },
    {
      idNumber: '12345', // Invalid
      name: 'Fatima Ali',
      sex: 'Female',
      dobDMY: '20-05-1985',
      issueDMY: '01-01-2020',
      expiryDMY: '01-01-2030'
    },
    {
      idNumber: '987654321098',
      name: 'Omar Mohamed',
      sex: 'Male',
      dobDMY: '10/12/1988', // Different format
      issueDMY: '01-01-2020',
      expiryDMY: '01-01-2030'
    }
  ];
  
  const batchResult = ID.validateBatch(records);
  
  if (batchResult.summary.total !== 3) {
    console.log(`Wrong total: ${batchResult.summary.total}`);
    return false;
  }
  
  if (batchResult.summary.successful !== 2) {
    console.log(`Wrong successful count: ${batchResult.summary.successful}`);
    return false;
  }
  
  if (batchResult.summary.failed !== 1) {
    console.log(`Wrong failed count: ${batchResult.summary.failed}`);
    return false;
  }
  
  if (batchResult.summary.successRate !== '66.67%') {
    console.log(`Wrong success rate: ${batchResult.summary.successRate}`);
    return false;
  }
  
  console.log(`Batch processing: ${batchResult.summary.successRate} success rate`);
  return true;
});

runTest('Performance - Date Parsing Cache', () => {
  const testDate = '15-03-1990';
  
  // Warm up cache
  ID.parseDate(testDate);
  
  // Test cache performance
  const iterations = 1000;
  const start = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    ID.parseDate(testDate);
  }
  
  const end = Date.now();
  const totalTime = end - start;
  
  console.log(`1000 cached date parses: ${totalTime}ms`);
  
  // Should be very fast with caching
  if (totalTime > 50) {
    console.log('Cache performance too slow');
    return false;
  }
  
  return true;
});

// ========================================
// PRIVACY TESTS
// ========================================

runTest('Privacy - Enhanced ID Masking', () => {
  const id = '934265782412';
  
  const defaultMask = ID.maskId(id);
  const customMask = ID.maskId(id, { head: 3, tail: 2 });
  const longMask = ID.maskId(id, { head: 4, tail: 4 });
  
  if (defaultMask !== '93*******412') {
    console.log(`Wrong default mask: ${defaultMask}`);
    return false;
  }
  
  if (customMask !== '934*******12') {
    console.log(`Wrong custom mask: ${customMask}`);
    return false;
  }
  
  if (longMask !== '9342****2412') {
    console.log(`Wrong long mask: ${longMask}`);
    return false;
  }
  
  console.log(`Masking options: ${defaultMask}, ${customMask}, ${longMask}`);
  return true;
});

runTest('Privacy - Record Redaction', () => {
  const record = {
    idNumber: '934265782412',
    name: 'Ahmed Hassan Mohamed',
    sex: 'Male',
    dobDMY: '15-03-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2030'
  };
  
  const redacted = ID.redact(record);
  
  if (!redacted.idNumber.includes('*')) {
    console.log('ID not masked in redaction');
    return false;
  }
  
  if (redacted.name !== '[REDACTED]') {
    console.log('Name not redacted');
    return false;
  }
  
  if (redacted.sex !== 'Male') {
    console.log('Sex should not be redacted by default');
    return false;
  }
  
  console.log('Record redaction working correctly');
  return true;
});

// ========================================
// BACKWARD COMPATIBILITY TESTS
// ========================================

runTest('Backward Compatibility - Legacy Functions', () => {
  const testDate = '15-03-1990';
  
  // Test legacy date functions
  if (!ID.isValidDMY(testDate)) {
    console.log('Legacy isValidDMY failed');
    return false;
  }
  
  const iso = ID.toISOFromDMY(testDate);
  if (!iso.includes('1990-03-15')) {
    console.log('Legacy toISOFromDMY failed');
    return false;
  }
  
  // Test original validateRecord still works
  const result = ID.validateRecord({
    idNumber: '934265782412',
    name: 'Ahmed Hassan',
    sex: 'Male',
    dobDMY: '15-03-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2030'
  });
  
  if (!result.ok) {
    console.log('Legacy validateRecord failed');
    return false;
  }
  
  console.log('All legacy functions working');
  return true;
});

runTest('Backward Compatibility - Error Structure', () => {
  try {
    ID.validateRecord({
      idNumber: '12345',
      name: 'Test',
      sex: 'Male',
      dobDMY: '01-01-1990',
      issueDMY: '01-01-2020',
      expiryDMY: '01-01-2030'
    });
    return false;
  } catch (error) {
    // Check that old error properties still exist
    if (!error.message || !error.code) {
      console.log('Missing basic error properties');
      return false;
    }
    
    if (!error.somaliMessage) {
      console.log('Missing Somali message for backward compatibility');
      return false;
    }
    
    // New properties should also exist
    if (!error.arabicMessage) {
      console.log('Missing new Arabic message');
      return false;
    }
    
    console.log('Error structure maintains backward compatibility');
    return true;
  }
});

// ========================================
// EDGE CASES AND ERROR HANDLING
// ========================================

runTest('Edge Cases - Empty and Null Inputs', () => {
  const edgeCases = [
    { input: null, expectedCode: 'INVALID_INPUT' },
    { input: undefined, expectedCode: 'INVALID_INPUT' },
    { input: {}, expectedCode: 'MISSING_FIELD' },
    { input: '', expectedCode: 'INVALID_INPUT' }
  ];
  
  for (const testCase of edgeCases) {
    try {
      ID.validateRecordFast(testCase.input);
      console.log(`Should have failed for: ${testCase.input}`);
      return false;
    } catch (error) {
      if (error.code !== testCase.expectedCode) {
        console.log(`Wrong error code for ${testCase.input}: ${error.code}`);
        return false;
      }
    }
  }
  
  console.log('Edge case handling working correctly');
  return true;
});

runTest('Edge Cases - Extreme Date Values', () => {
  const extremeDates = [
    '29-02-2020', // Valid leap year
    '29-02-2021', // Invalid leap year
    '31-04-2020', // Invalid day for April
    '00-01-2020', // Invalid day
    '01-00-2020', // Invalid month
  ];
  
  // Valid leap year should pass
  if (!ID.isValidDate(extremeDates[0])) {
    console.log('Valid leap year date rejected');
    return false;
  }
  
  // Invalid dates should fail
  for (let i = 1; i < extremeDates.length; i++) {
    if (ID.isValidDate(extremeDates[i])) {
      console.log(`Invalid date accepted: ${extremeDates[i]}`);
      return false;
    }
  }
  
  console.log('Extreme date validation working correctly');
  return true;
});

// ========================================
// CONFIGURATION TESTS
// ========================================

runTest('Configuration - Custom Rules', () => {
  const customRules = {
    idNumber: {
      length: 10,
      mustStart: "93",
      allowSpaces: false
    },
    nameMaxLen: 50,
    allowArabic: false,
    requireFutureExpiry: false
  };
  
  // Should pass with custom rules
  const result = ID.validateRecord({
    idNumber: '9312345678', // 10 digits starting with 93
    name: 'Ahmed Hassan',
    sex: 'Male',
    dobDMY: '01-01-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2025' // Past expiry allowed
  }, customRules);
  
  if (!result.ok) {
    console.log('Custom rules validation failed');
    return false;
  }
  
  // Should fail with default rules
  try {
    ID.validateRecord({
      idNumber: '9312345678', // Too short for default rules
      name: 'Ahmed Hassan',
      sex: 'Male',
      dobDMY: '01-01-1990',
      issueDMY: '01-01-2020',
      expiryDMY: '01-01-2025'
    });
    console.log('Should have failed with default rules');
    return false;
  } catch (error) {
    if (error.code !== 'INVALID_ID_NUMBER') {
      console.log('Wrong error with default rules');
      return false;
    }
  }
  
  console.log('Custom configuration working correctly');
  return true;
});

// ========================================
// TEST SUMMARY
// ========================================

console.log('═'.repeat(80));
console.log(`📊 Comprehensive Test Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(80));

if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED! Package is ready for production!');
  console.log('✅ Core validation: Working');
  console.log('✅ Enhanced date formats: Working');
  console.log('✅ Trilingual support: Working');
  console.log('✅ Performance optimizations: Working');
  console.log('✅ Privacy features: Working');
  console.log('✅ Backward compatibility: Maintained');
  console.log('✅ Edge cases: Handled');
  console.log('✅ Custom configuration: Working');
  console.log('\n🚀 Ready for v0.2.0 release!');
  process.exit(0);
} else {
  console.log('💥 Some tests failed! Please review and fix issues.');
  process.exit(1);
}