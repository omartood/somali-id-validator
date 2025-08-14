# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-08-14

### 🚀 Added
- **Enhanced Date Format Support**: Multiple date formats (dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, dd.mm.yyyy)
- **Trilingual Support**: Arabic language support alongside English and Somali
- **Interactive CLI Mode**: Step-by-step validation with multilingual prompts
- **Batch Processing**: Process multiple records from CSV files
- **Performance Optimizations**: Fast validation with caching and batch processing
- **Enhanced Masking**: Custom head/tail options for ID masking
- **Multilingual Validation Function**: `validateRecordMultilingual()` with language selection
- **Date Parsing Cache**: Performance-optimized date parsing with intelligent caching
- **Format Help Command**: `somalid formats` to show all supported formats

### 🌍 Languages
- **Arabic Error Messages**: Complete Arabic translations for all error messages
- **Enhanced Somali Support**: Improved contextual translations
- **Language Selection**: CLI support for language preference (--lang en/so/ar)

### ⚡ Performance
- **Fast Validation**: Average 0.02-0.05ms per validation
- **Batch Processing**: Process multiple records with comprehensive statistics
- **Memory Optimization**: Efficient caching with automatic cleanup
- **Early Return Optimization**: Faster validation for invalid inputs

### 🔒 Privacy
- **Enhanced Masking**: Customizable head/tail digit display
- **Batch Redaction**: Process multiple records safely
- **Privacy-First CLI**: Never shows full IDs in output

### 🛠️ Developer Experience
- **TypeScript Definitions**: Complete type definitions for all new features
- **Comprehensive Testing**: 38 tests covering all functionality
- **Backward Compatibility**: 100% compatible with v0.1.0
- **Enhanced Documentation**: Updated README with examples and guides

### 📦 CLI Enhancements
- **Interactive Mode**: `somalid interactive` for guided validation
- **Batch Processing**: `somalid batch --file ids.csv --output results.json`
- **Enhanced Masking**: `somalid mask --id 123 --head 4 --tail 2`
- **Format Help**: `somalid formats` shows all supported date formats
- **Multilingual Errors**: CLI shows errors in multiple languages

## [0.1.0] - 2025-08-14

### 🚀 Added
- **Initial Release**: Core Somali ID validation functionality
- **Bilingual Support**: Error messages in English and Somali
- **CLI Tool**: Command-line interface for validation and masking
- **Privacy Features**: ID masking and record redaction
- **TypeScript Support**: Full type definitions
- **Zero Dependencies**: Lightweight and secure
- **Configurable Rules**: Customizable validation parameters

### 🔍 Core Features
- **ID Number Validation**: 12-digit numeric validation with configurable rules
- **Name Validation**: Support for Latin and Arabic characters
- **Gender Validation**: Male/Female validation with multiple input formats
- **Date Validation**: dd-mm-yyyy format with logical consistency checks
- **Privacy Masking**: Configurable ID masking (default: 93*******412)
- **Record Redaction**: Sensitive field redaction for privacy

### 🌍 Internationalization
- **English Support**: Default language for all messages
- **Somali Support**: Complete Af-Soomaali translations
- **Cultural Sensitivity**: Designed for Somali community worldwide

### 📦 Package Features
- **NPM Package**: Easy installation and integration
- **CLI Binary**: Global `somalid` command
- **MIT License**: Open source and commercial-friendly
- **Comprehensive Documentation**: Complete README with examples
- **Test Coverage**: Full test suite with integration tests

[0.2.0]: https://github.com/omartood/somali-id-validator/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/omartood/somali-id-validator/releases/tag/v0.1.0