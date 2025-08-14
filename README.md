# 🇸🇴 Somali ID Validator v0.2.0

A comprehensive Node.js package for validating Somali National ID cards with enhanced date formats, trilingual support (English/Somali/Arabic), interactive CLI, and performance optimizations.

[![npm version](https://badge.fury.io/js/somali-id-validator.svg)](https://badge.fury.io/js/somali-id-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/omartood/somali-id-validator.svg)](https://github.com/omartood/somali-id-validator/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/omartood/somali-id-validator.svg)](https://github.com/omartood/somali-id-validator/issues)
[![GitHub forks](https://img.shields.io/github/forks/omartood/somali-id-validator.svg)](https://github.com/omartood/somali-id-validator/network)

## ✨ Features

- 🔍 **Complete ID Validation** - Validates ID number, name, gender, and dates
- 🌍 **Trilingual Support** - Error messages in English, Somali (Af-Soomaali), and Arabic (العربية)
- 📅 **Enhanced Date Formats** - Supports dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, dd.mm.yyyy
- 🔒 **Privacy Protection** - Built-in masking and redaction functions
- ⚡ **Interactive CLI** - Command-line interface with interactive mode and batch processing
- 🚀 **Performance Optimized** - Fast validation with caching and batch processing
- 📝 **TypeScript Support** - Full type definitions included
- 🛡️ **Configurable Rules** - Customizable validation rules
- 🎯 **Zero Dependencies** - Lightweight and secure

## 📦 Installation

```bash
npm install somali-id-validator
```

For global CLI usage:
```bash
npm install -g somali-id-validator
```

## 🚀 Quick Start

### Basic Usage

```javascript
const ID = require('somali-id-validator');

// Validate a complete ID record
const result = ID.validateRecord({
  idNumber: '934265782412',
  name: 'Ahmed Hassan Mohamed',
  sex: 'Male',
  dobDMY: '15-03-1990',      // Date of Birth (dd-mm-yyyy)
  issueDMY: '01-01-2020',    // Issue Date (dd-mm-yyyy)
  expiryDMY: '01-01-2030'    // Expiry Date (dd-mm-yyyy)
});

console.log(result);
// Output: { ok: true, idNumber: '934265782412', name: 'Ahmed Hassan Mohamed', ... }
```

### Enhanced Date Format Support (v0.2.0)

```javascript
// Multiple date formats supported
const result = ID.validateRecord({
  idNumber: '934265782412',
  name: 'Ahmed Hassan Mohamed',
  sex: 'Male',
  dobDMY: '1990-03-15',      // yyyy-mm-dd format
  issueDMY: '01/01/2020',    // dd/mm/yyyy format
  expiryDMY: '01.01.2030'    // dd.mm.yyyy format
});
```

### Trilingual Error Messages (v0.2.0)

```javascript
try {
  ID.validateRecordMultilingual({
    idNumber: '12345', // Invalid: too short
    name: 'أحمد حسن',   // Arabic name
    sex: 'Male',
    dobDMY: '01-01-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2030'
  }, ID.DEFAULT_RULE, 'ar'); // Request Arabic errors
} catch (error) {
  console.log('English:', error.message);
  // "ID number must be exactly 12 digits"
  
  console.log('Somali:', error.somaliMessage);
  // "Lambarka aqoonsiga waa inuu noqdaa 12 tiro oo keliya"
  
  console.log('Arabic:', error.arabicMessage);
  // "رقم الهوية يجب أن يكون رقماً صحيحاً"
  
  console.log('Localized:', error.localizedMessage);
  // Returns message in requested language
}
```

### Performance Features (v0.2.0)

```javascript
// Fast validation for high-throughput scenarios
const result = ID.validateRecordFast(data);

// Batch processing
const records = [data1, data2, data3];
const batchResult = ID.validateBatch(records);
console.log(`Success rate: ${batchResult.summary.successRate}`);
```

## 🔒 Privacy Features

### ID Masking
```javascript
const masked = ID.maskId('934265782412');
console.log(masked); // "93*******412"

// Custom masking
const customMasked = ID.maskId('934265782412', { head: 3, tail: 2 });
console.log(customMasked); // "934*******12"
```

### Record Redaction
```javascript
const record = {
  idNumber: '934265782412',
  name: 'Ahmed Hassan',
  sex: 'Male'
};

const redacted = ID.redact(record);
console.log(redacted);
// { idNumber: '93*******412', name: '[REDACTED]', sex: 'Male' }
```

## 🖥️ Enhanced CLI Usage (v0.2.0)

### Installation
```bash
npm install -g somali-id-validator
```

### Commands

#### Interactive Mode (NEW!)
```bash
somalid interactive
```
Step-by-step validation with multilingual prompts.

#### Validate ID Record with Enhanced Date Formats
```bash
# Multiple date formats supported
somalid validate \
  --id 934265782412 \
  --name "Ahmed Hassan Mohamed" \
  --sex Male \
  --dob 1990-03-15 \
  --issue 01/01/2020 \
  --expiry 01.01.2030
```

#### Multilingual Validation (NEW!)
```bash
# Arabic language support
somalid validate \
  --id 934265782412 \
  --name "أحمد حسن محمد" \
  --sex Male \
  --dob 15-03-1990 \
  --issue 01-01-2020 \
  --expiry 01-01-2030 \
  --lang ar
```

**Trilingual Error Output:**
```json
{
  "ok": false,
  "error": "ID number must be exactly 12 digits",
  "code": "INVALID_ID_NUMBER",
  "somaliError": "Lambarka aqoonsiga waa inuu noqdaa 12 tiro oo keliya",
  "arabicError": "رقم الهوية يجب أن يكون رقماً صحيحاً",
  "localizedError": "رقم الهوية يجب أن يكون رقماً صحيحاً"
}
```

#### Batch Processing (NEW!)
```bash
# Process multiple records from CSV
somalid batch --file ids.csv --output results.json
```

#### Enhanced Masking (NEW!)
```bash
# Custom masking options
somalid mask --id 934265782412 --head 4 --tail 2
# Output: 9342******12
```

#### Format Help (NEW!)
```bash
somalid formats
```
Shows all supported date formats and languages.

#### Success Output
```json
{
  "ok": true,
  "data": {
    "name": "Ahmed Hassan Mohamed",
    "sex": "Male",
    "dobISO": "1990-03-15T00:00:00.000Z",
    "issueISO": "2020-01-01T00:00:00.000Z",
    "expiryISO": "2030-01-01T00:00:00.000Z",
    "idMasked": "93*******412"
  }
}
```

## 📋 Validation Rules

### Default Configuration
```javascript
const DEFAULT_RULE = {
  idNumber: {
    length: 12,          // Must be exactly 12 digits
    mustStart: null,     // No required prefix (configurable)
    allowSpaces: true    // Spaces are automatically removed
  },
  nameMaxLen: 120,       // Maximum name length
  allowArabic: true,     // Allow Arabic characters in names
  requireFutureExpiry: true  // Expiry date must be in future
};
```

### Custom Validation
```javascript
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

const result = ID.validateRecord(data, customRules);
```

## 🌍 Trilingual Error Messages (v0.2.0)

All error messages are provided in English, Somali, and Arabic:

| Error Code | English | Somali (Af-Soomaali) | Arabic (العربية) |
|------------|---------|----------------------|------------------|
| `INVALID_ID_NUMBER` | ID number must be numeric | Lambarka aqoonsiga waa inuu noqdaa tiro sax ah | رقم الهوية يجب أن يكون رقماً صحيحاً |
| `INVALID_NAME` | Name contains invalid characters | Magaca wuxuu leeyahay xarfo aan la aqbali karin | الاسم يحتوي على أحرف غير صالحة |
| `INVALID_SEX` | Sex must be Male/Female | Jinsiga waa inuu noqdaa Lab ama Dhedig | الجنس يجب أن يكون ذكر أو أنثى |
| `INVALID_DATE` | Date format invalid | Taariikhda waa inay noqoto qaabka saxda ah | التاريخ يجب أن يكون بالتنسيق الصحيح |
| `INCONSISTENT_DATES` | Dates are inconsistent | Taariikhyada ma wada waafaqsana | التواريخ غير متسقة |

### Supported Date Formats (v0.2.0)
| Format | Example | Description |
|--------|---------|-------------|
| `dd-mm-yyyy` | 15-03-1990 | Day-Month-Year (default) |
| `dd/mm/yyyy` | 15/03/1990 | Day/Month/Year (slash) |
| `yyyy-mm-dd` | 1990-03-15 | Year-Month-Day (ISO) |
| `dd.mm.yyyy` | 15.03.1990 | Day.Month.Year (dot) |

### Accessing Multilingual Messages
```javascript
// Get all language messages
console.log(ID.SOMALI_MESSAGES);
console.log(ID.ARABIC_MESSAGES);

// Get supported languages
console.log(ID.SUPPORTED_LANGUAGES);
// { en: 'English', so: 'Somali', ar: 'Arabic' }

// Get localized message
const arabicMsg = ID.getLocalizedMessage('INVALID_ID_NUMBER', 'ar');
console.log(arabicMsg); // "رقم الهوية يجب أن يكون رقماً صحيحاً"
```

## 📚 API Reference

### Core Functions

#### `validateRecord(input, config?)`
Validates a complete ID record.

**Parameters:**
- `input` (object): ID record to validate
  - `idNumber` (string): 12-digit ID number
  - `name` (string): Full name
  - `sex` (string): 'Male', 'Female', 'M', or 'F'
  - `dobDMY` (string): Date of birth (multiple formats supported)
  - `issueDMY` (string): Issue date (multiple formats supported)
  - `expiryDMY` (string): Expiry date (multiple formats supported)
- `config` (object, optional): Custom validation rules

**Returns:** Validated record object

#### Enhanced Functions (v0.2.0)

#### `validateRecordFast(input, config?)`
Performance-optimized validation with early returns and input validation.

#### `validateRecordMultilingual(input, config?, language?)`
Validates with localized error messages.

**Parameters:**
- `language` (string): 'en', 'so', or 'ar'

#### `validateBatch(records, config?)`
Validates multiple records efficiently.

**Returns:** Batch result with summary statistics

#### Date Functions (v0.2.0)

#### `parseDate(dateStr)`
Parses date string in any supported format.

**Returns:** `{ dd, mm, yyyy, format }` or `null`

#### `isValidDate(dateStr)`
Checks if date string is valid in any supported format.

#### `toISOFromDate(dateStr)`
Converts date string to ISO format.

#### Individual Validators

#### `validateIdNumber(idNumber, config?)`
Validates just the ID number.

#### `validateName(name, config?)`
Validates the name field.

#### `validateSex(sex)`
Validates the gender field.

#### `validateDates(dates, config?)`
Validates date fields and their consistency.

### Privacy Functions

#### `maskId(idNumber, options?)`
Masks an ID number for privacy.

**Parameters:**
- `idNumber` (string): ID number to mask
- `options` (object, optional): `{ head: 2, tail: 3 }`

#### `redact(record, fields?)`
Redacts sensitive fields from a record.

### Error Handling

#### `SomaliIdError`
Custom error class with bilingual messages.

**Properties:**
- `message` (string): English error message
- `somaliMessage` (string): Somali error message
- `code` (string): Error code

## 🔧 Configuration Examples

### Strict Validation
```javascript
const strictRules = {
  idNumber: {
    length: 12,
    mustStart: "93",  // Must start with "93"
    allowSpaces: false
  },
  nameMaxLen: 50,
  allowArabic: false,
  requireFutureExpiry: true
};
```

### Flexible Validation
```javascript
const flexibleRules = {
  idNumber: {
    length: null,     // Any length
    mustStart: null,  // Any prefix
    allowSpaces: true
  },
  nameMaxLen: 200,
  allowArabic: true,
  requireFutureExpiry: false
};
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test bilingual error messages:
```bash
node somali-test.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
git clone https://github.com/omartood/somali-id-validator.git
cd somali-id-validator
npm install
npm test
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Somali community worldwide
- Supports both diaspora and local users
- Designed with privacy and security in mind

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the examples in this README
- Review the test files for usage patterns

---

**Made with ❤️ for the Somali community** 🇸🇴