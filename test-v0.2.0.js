#!/usr/bin/env node

/**
 * Comprehensive Tests for Somali ID Validator v0.2.0
 * Tests all new Phase 1 features
 */

const ID = require("./src/index.js");

console.log("🚀 Testing Somali ID Validator v0.2.0 - Phase 1 Features\n");

let passed = 0;
let failed = 0;

function runTest(name, testFn) {
  console.log(`🔍 ${name}`);
  try {
    const result = testFn();
    if (result) {
      console.log("✅ PASSED\n");
      passed++;
    } else {
      console.log("❌ FAILED\n");
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failed++;
  }
}

// Test 1: Enhanced Date Format Support
runTest("Enhanced Date Formats - Multiple Format Support", () => {
  const formats = [
    "15-03-1990", // dd-mm-yyyy
    "15/03/1990", // dd/mm/yyyy
    "1990-03-15", // yyyy-mm-dd
    "15.03.1990", // dd.mm.yyyy
  ];

  for (const dateStr of formats) {
    const parsed = ID.parseDate(dateStr);
    if (
      !parsed ||
      parsed.dd !== 15 ||
      parsed.mm !== 3 ||
      parsed.yyyy !== 1990
    ) {
      console.log(`Failed to parse: ${dateStr}`);
      return false;
    }

    if (!ID.isValidDate(dateStr)) {
      console.log(`Invalid date: ${dateStr}`);
      return false;
    }

    const iso = ID.toISOFromDate(dateStr);
    if (!iso.includes("1990-03-15")) {
      console.log(`Wrong ISO conversion for: ${dateStr} -> ${iso}`);
      return false;
    }
  }

  console.log("All date formats parsed correctly");
  return true;
});

// Test 2: Arabic Language Support
runTest("Arabic Language Support", () => {
  try {
    ID.validateRecord({
      idNumber: "12345", // Invalid
      name: "أحمد حسن",
      sex: "Male",
      dobDMY: "01-01-1990",
      issueDMY: "01-01-2020",
      expiryDMY: "01-01-2030",
    });
    return false; // Should have thrown error
  } catch (error) {
    if (!error.arabicMessage) {
      console.log("Missing Arabic error message");
      return false;
    }
    if (!error.arabicMessage.includes("رقم الهوية")) {
      console.log(`Unexpected Arabic message: ${error.arabicMessage}`);
      return false;
    }
    console.log(`Arabic error: ${error.arabicMessage}`);
    return true;
  }
});

// Test 3: Multilingual Validation
runTest("Multilingual Validation Function", () => {
  try {
    ID.validateRecordMultilingual(
      {
        idNumber: "934265782412", // Valid ID
        name: "Test User",
        sex: "Unknown", // This will trigger the error
        dobDMY: "01-01-1990",
        issueDMY: "01-01-2020",
        expiryDMY: "01-01-2030",
      },
      ID.DEFAULT_RULE,
      "ar"
    );
    return false;
  } catch (error) {
    if (!error.localizedMessage || !error.localizedMessage.includes("الجنس")) {
      console.log(
        `Missing or wrong localized message: ${error.localizedMessage}`
      );
      console.log(`Error code: ${error.code}`);
      console.log(`Arabic message: ${error.arabicMessage}`);
      return false;
    }
    console.log(`Localized Arabic error: ${error.localizedMessage}`);
    return true;
  }
});

// Test 4: Performance - Fast Validation
runTest("Performance - Fast Validation", () => {
  const validRecord = {
    idNumber: "934265782412",
    name: "Ahmed Hassan Mohamed",
    sex: "Male",
    dobDMY: "15-03-1990",
    issueDMY: "01-01-2020",
    expiryDMY: "01-01-2030",
  };

  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    ID.validateRecordFast(validRecord);
  }
  const end = Date.now();

  const timePerValidation = (end - start) / 100;
  console.log(`Average validation time: ${timePerValidation.toFixed(2)}ms`);

  return timePerValidation < 10; // Should be under 10ms per validation
});

// Test 5: Batch Processing
runTest("Batch Processing", () => {
  const records = [
    {
      idNumber: "934265782412",
      name: "Ahmed Hassan",
      sex: "Male",
      dobDMY: "15-03-1990",
      issueDMY: "01-01-2020",
      expiryDMY: "01-01-2030",
    },
    {
      idNumber: "12345", // Invalid
      name: "Fatima Ali",
      sex: "Female",
      dobDMY: "20-05-1985",
      issueDMY: "01-01-2020",
      expiryDMY: "01-01-2030",
    },
    {
      idNumber: "987654321098",
      name: "Omar Mohamed",
      sex: "Male",
      dobDMY: "10-12-1988",
      issueDMY: "01-01-2020",
      expiryDMY: "01-01-2030",
    },
  ];

  const batchResult = ID.validateBatch(records);

  if (batchResult.summary.total !== 3) {
    console.log(`Wrong total count: ${batchResult.summary.total}`);
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

  console.log(`Batch result: ${batchResult.summary.successRate} success rate`);
  return true;
});

// Test 6: Date Caching Performance
runTest("Date Parsing Cache Performance", () => {
  const testDate = "15-03-1990";

  // First parse (cache miss)
  const start1 = Date.now();
  for (let i = 0; i < 1000; i++) {
    ID.parseDate(testDate);
  }
  const time1 = Date.now() - start1;

  // Second parse (cache hit)
  const start2 = Date.now();
  for (let i = 0; i < 1000; i++) {
    ID.parseDate(testDate);
  }
  const time2 = Date.now() - start2;

  console.log(`Cache miss time: ${time1}ms, Cache hit time: ${time2}ms`);

  // Cache hits should generally be faster or similar (allow for system variations)
  return time2 <= time1 + 2; // Allow 2ms tolerance
});

// Test 7: Language Support Constants
runTest("Language Support Constants", () => {
  const languages = ID.SUPPORTED_LANGUAGES;

  if (!languages.en || !languages.so || !languages.ar) {
    console.log("Missing supported languages");
    return false;
  }

  if (
    languages.en !== "English" ||
    languages.so !== "Somali" ||
    languages.ar !== "Arabic"
  ) {
    console.log("Wrong language names");
    return false;
  }

  console.log("Supported languages:", Object.keys(languages).join(", "));
  return true;
});

// Test 8: Enhanced Masking Options
runTest("Enhanced ID Masking Options", () => {
  const id = "934265782412";

  const defaultMask = ID.maskId(id);
  const customMask = ID.maskId(id, { head: 3, tail: 2 });
  const longMask = ID.maskId(id, { head: 4, tail: 4 });

  if (defaultMask !== "93*******412") {
    console.log(`Wrong default mask: ${defaultMask}`);
    return false;
  }

  if (customMask !== "934*******12") {
    console.log(`Wrong custom mask: ${customMask}`);
    return false;
  }

  if (longMask !== "9342****2412") {
    console.log(`Wrong long mask: ${longMask}`);
    return false;
  }

  console.log(`Masks: ${defaultMask}, ${customMask}, ${longMask}`);
  return true;
});

// Test 9: Error Code Coverage
runTest("New Error Codes", () => {
  const codes = ID.CODES;

  if (!codes.INVALID_INPUT || !codes.MISSING_FIELD) {
    console.log("Missing new error codes");
    return false;
  }

  // Test INVALID_INPUT
  try {
    ID.validateRecordFast(null);
    return false;
  } catch (error) {
    if (error.code !== "INVALID_INPUT") {
      console.log(`Wrong error code for null input: ${error.code}`);
      return false;
    }
  }

  // Test MISSING_FIELD
  try {
    ID.validateRecordFast({});
    return false;
  } catch (error) {
    if (error.code !== "MISSING_FIELD") {
      console.log(`Wrong error code for missing field: ${error.code}`);
      return false;
    }
  }

  console.log("New error codes working correctly");
  return true;
});

// Test 10: Backward Compatibility
runTest("Backward Compatibility", () => {
  // Test legacy functions still work
  const testDate = "15-03-1990";

  if (!ID.isValidDMY(testDate)) {
    console.log("Legacy isValidDMY failed");
    return false;
  }

  const iso = ID.toISOFromDMY(testDate);
  if (!iso.includes("1990-03-15")) {
    console.log("Legacy toISOFromDMY failed");
    return false;
  }

  // Test old validation still works
  const result = ID.validateRecord({
    idNumber: "934265782412",
    name: "Ahmed Hassan",
    sex: "Male",
    dobDMY: "15-03-1990",
    issueDMY: "01-01-2020",
    expiryDMY: "01-01-2030",
  });

  if (!result.ok) {
    console.log("Legacy validateRecord failed");
    return false;
  }

  console.log("All legacy functions working");
  return true;
});

// Test Summary
console.log("═".repeat(60));
console.log(`📊 Phase 1 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("🎉 All Phase 1 features working perfectly!");
  console.log("✅ Ready for v0.2.0 release!");
  process.exit(0);
} else {
  console.log("💥 Some Phase 1 features need attention!");
  process.exit(1);
}
