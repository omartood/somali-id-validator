# 🇸🇴 Somali ID Validator

A comprehensive Node.js package for validating Somali National ID cards with bilingual error messages in English and Somali (Af-Soomaali).

[![npm version](https://badge.fury.io/js/somali-id-validator.svg)](https://badge.fury.io/js/somali-id-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔍 **Complete ID Validation** - Validates ID number, name, gender, and dates
- 🌍 **Bilingual Support** - Error messages in English and Somali (Af-Soomaali)
- 🔒 **Privacy Protection** - Built-in masking and redaction functions
- ⚡ **CLI Tool** - Command-line interface for quick validation
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

### Error Handling with Bilingual Messages

```javascript
try {
  ID.validateRecord({
    idNumber: '12345', // Invalid: too short
    name: 'Ahmed Hassan',
    sex: 'Male',
    dobDMY: '01-01-1990',
    issueDMY: '01-01-2020',
    expiryDMY: '01-01-2030'
  });
} catch (error) {
  console.log('English:', error.message);
  // "ID number must be exactly 12 digits"
  
  console.log('Somali:', error.somaliMessage);
  // "Lambarka aqoonsiga waa inuu noqdaa 12 tiro oo keliya"
  
  console.log('Code:', error.code);
  // "INVALID_ID_NUMBER"
}
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

## 🖥️ CLI Usage

### Installation
```bash
npm install -g somali-id-validator
```

### Commands

#### Validate ID Record
```bash
somalid validate \
  --id 934265782412 \
  --name "Ahmed Hassan Mohamed" \
  --sex Male \
  --dob 15-03-1990 \
  --issue 01-01-2020 \
  --expiry 01-01-2030
```

**Success Output:**
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

**Error Output (Bilingual):**
```json
{
  "ok": false,
  "error": "ID number must be exactly 12 digits",
  "code": "INVALID_ID_NUMBER",
  "somaliError": "Lambarka aqoonsiga waa inuu noqdaa 12 tiro oo keliya"
}
```

#### Mask ID Number
```bash
somalid mask --id 934265782412
# Output: 93*******412
```

#### Help
```bash
somalid --help
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

## 🌍 Bilingual Error Messages

All error messages are provided in both English and Somali:

| Error Code | English | Somali (Af-Soomaali) |
|------------|---------|----------------------|
| `INVALID_ID_NUMBER` | ID number must be numeric | Lambarka aqoonsiga waa inuu noqdaa tiro sax ah |
| `INVALID_NAME` | Name contains invalid characters | Magaca wuxuu leeyahay xarfo aan la aqbali karin |
| `INVALID_SEX` | Sex must be Male/Female | Jinsiga waa inuu noqdaa Lab ama Dhedig |
| `INVALID_DATE` | Date must be dd-mm-yyyy | Taariikhda waa inay noqoto qaabka dd-mm-yyyy |
| `INCONSISTENT_DATES` | Dates are inconsistent | Taariikhyada ma wada waafaqsana |

### Accessing Somali Messages
```javascript
// Get all Somali error messages
console.log(ID.SOMALI_MESSAGES);

// Access specific message
console.log(ID.SOMALI_MESSAGES.INVALID_ID_NUMBER);
// "Lambarka aqoonsiga waa inuu noqdaa tiro sax ah"
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
  - `dobDMY` (string): Date of birth (dd-mm-yyyy)
  - `issueDMY` (string): Issue date (dd-mm-yyyy)
  - `expiryDMY` (string): Expiry date (dd-mm-yyyy)
- `config` (object, optional): Custom validation rules

**Returns:** Validated record object

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
git clone https://github.com/yourusername/somali-id-validator.git
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