const { SomaliIdError, CODES, SOMALI_MESSAGES, ARABIC_MESSAGES, SUPPORTED_LANGUAGES, getLocalizedMessage } = require("./errors");

/**
 * NOTE:
 * There is no public, immutable NIRA spec published here, so defaults are conservative and configurable.
 * Defaults assume a 12-digit numeric ID; many cards begin with '9' (but we don't hard-require it).
 */
const DEFAULT_RULE = {
  idNumber: {
    length: 12,          // set to 10..12 if needed
    mustStart: null,     // e.g. "93" if your org requires
    allowSpaces: true
  },
  nameMaxLen: 120,
  allowArabic: true,     // allow Arabic letters alongside Latin
  requireFutureExpiry: true
};

// ---------- helpers ----------
const DIGITS_RX = /^[0-9]+$/;
const clampDigits = (s) => String(s || "").replace(/\D/g, "");
const isDigits = (s) => DIGITS_RX.test(s);
const pad2 = (n) => String(n).padStart(2, "0");

// Helper to throw errors with multilingual support
function throwLocalizedError(englishMsg, code, customLocalizedMsg = null, language = 'so') {
  let localizedMsg = customLocalizedMsg;
  if (!localizedMsg) {
    localizedMsg = getLocalizedMessage(code, language) || SOMALI_MESSAGES[code];
  }
  
  const error = new SomaliIdError(englishMsg, code, localizedMsg);
  // Add Arabic message if available
  if (language !== 'ar') {
    error.arabicMessage = getLocalizedMessage(code, 'ar');
  }
  return error;
}

// Legacy function for backward compatibility
function throwSomaliError(englishMsg, code, customSomaliMsg = null) {
  const error = throwLocalizedError(englishMsg, code, customSomaliMsg, 'so');
  throw error;
}

// Enhanced date validation - supports multiple formats
const DATE_FORMATS = {
  'dd-mm-yyyy': /^(\d{2})-(\d{2})-(\d{4})$/,
  'dd/mm/yyyy': /^(\d{2})\/(\d{2})\/(\d{4})$/,
  'yyyy-mm-dd': /^(\d{4})-(\d{2})-(\d{2})$/,
  'dd.mm.yyyy': /^(\d{2})\.(\d{2})\.(\d{4})$/
};

// Remove duplicate - will use the optimized version below

function isValidDate(dateStr) {
  const parsed = parseDate(dateStr);
  if (!parsed) return false;
  
  const { dd, mm, yyyy } = parsed;
  if (yyyy < 1900 || yyyy > 2100) return false;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
  
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  return d.getUTCFullYear() === yyyy && d.getUTCMonth() === mm - 1 && d.getUTCDate() === dd;
}

function toISOFromDate(dateStr) {
  const parsed = parseDate(dateStr);
  if (!parsed) throw new Error('Invalid date format');
  
  const { dd, mm, yyyy } = parsed;
  return new Date(Date.UTC(yyyy, mm - 1, dd)).toISOString();
}

// Legacy function for backward compatibility
function isValidDMY(s) {
  return isValidDate(s);
}

function toISOFromDMY(dmy) {
  return toISOFromDate(dmy);
}

// Optionally use Luhn if issuer confirms a checksum later
function luhnCheck(numStr) {
  let sum = 0, dbl = false;
  for (let i = numStr.length - 1; i >= 0; i--) {
    let n = Number(numStr[i]);
    if (dbl) { n *= 2; if (n > 9) n -= 9; }
    sum += n; dbl = !dbl;
  }
  return sum % 10 === 0;
}

// ---------- field validators ----------
function validateIdNumber(raw, cfg = DEFAULT_RULE) {
  const digits = cfg.idNumber.allowSpaces ? clampDigits(raw) : String(raw || "");
  if (!isDigits(digits)) {
    throwSomaliError("ID number must be numeric", CODES.INVALID_ID_NUMBER);
  }
  if (cfg.idNumber.length && digits.length !== cfg.idNumber.length) {
    throwSomaliError(
      `ID number must be exactly ${cfg.idNumber.length} digits`, 
      CODES.INVALID_ID_NUMBER,
      `Lambarka aqoonsiga waa inuu noqdaa ${cfg.idNumber.length} tiro oo keliya`
    );
  }
  if (cfg.idNumber.mustStart && !digits.startsWith(cfg.idNumber.mustStart)) {
    throwSomaliError(
      `ID number must start with ${cfg.idNumber.mustStart}`, 
      CODES.INVALID_ID_NUMBER,
      `Lambarka aqoonsiga waa inuu ku bilaabmo ${cfg.idNumber.mustStart}`
    );
  }
  return digits;
}

function validateName(name, cfg = DEFAULT_RULE) {
  const s = String(name || "").trim();
  const rx = cfg.allowArabic
    ? /^[\p{L}\p{M}\s'.-]+$/u
    : /^[A-Za-z\s'.-]+$/;
  if (!s || s.length > cfg.nameMaxLen || !rx.test(s)) {
    throwSomaliError("Name contains invalid characters or is too long", CODES.INVALID_NAME);
  }
  return s.replace(/\s+/g, " ");
}

function validateSex(sex) {
  const s = String(sex || "").toLowerCase();
  if (!["female","male","f","m"].includes(s)) {
    throwSomaliError("Sex must be Male/Female", CODES.INVALID_SEX);
  }
  return s.startsWith("f") ? "Female" : "Male";
}

function validateDateDMY(label, s, somaliLabel) {
  if (!isValidDMY(s)) {
    throwSomaliError(
      `${label} must be in format: dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, or dd.mm.yyyy`, 
      CODES.INVALID_DATE,
      `${somaliLabel} waa inay noqoto mid ka mid ah: dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, ama dd.mm.yyyy`
    );
  }
  return s;
}

function validateDates({ dobDMY, issueDMY, expiryDMY }, cfg = DEFAULT_RULE) {
  const dobISO = toISOFromDMY(validateDateDMY("Date of Birth", dobDMY, "Taariikhda dhalashada"));
  const issueISO = toISOFromDMY(validateDateDMY("Date of Issue", issueDMY, "Taariikhda bixinta"));
  const expiryISO = toISOFromDMY(validateDateDMY("Date of Expiry", expiryDMY, "Taariikhda dhicitaanka"));

  const dob = Date.parse(dobISO);
  const issue = Date.parse(issueISO);
  const expiry = Date.parse(expiryISO);

  if (issue <= dob) {
    throwSomaliError(
      "Issue date must be after date of birth", 
      CODES.INCONSISTENT_DATES,
      "Taariikhda bixinta waa inay ka dambayso taariikhda dhalashada"
    );
  }
  if (expiry <= issue) {
    throwSomaliError(
      "Expiry date must be after issue date", 
      CODES.INCONSISTENT_DATES,
      "Taariikhda dhicitaanka waa inay ka dambayso taariikhda bixinta"
    );
  }
  if (cfg.requireFutureExpiry && expiry <= Date.now()) {
    throwSomaliError(
      "Expiry date must be in the future", 
      CODES.INCONSISTENT_DATES,
      "Taariikhda dhicitaanka waa inay mustaqbalka ku tahay"
    );
  }
  return { dobISO, issueISO, expiryISO };
}

// ---------- privacy helpers ----------
function maskId(idDigits, show = { head: 2, tail: 3 }) {
  const d = clampDigits(idDigits);
  if (!d) return "";
  const head = d.slice(0, show.head);
  const tail = d.slice(-show.tail);
  return `${head}${"*".repeat(Math.max(d.length - show.head - show.tail, 0))}${tail}`;
}
function redact(obj, fields = ["idNumber","name","dob","issue","expiry"]) {
  const out = { ...obj };
  if (out.idNumber) out.idNumber = maskId(out.idNumber);
  if (out.name) out.name = "[REDACTED]";
  if (out.dob) out.dob = "[REDACTED]";
  if (out.issue) out.issue = "[REDACTED]";
  if (out.expiry) out.expiry = "[REDACTED]";
  return out;
}

// ---------- high-level API ----------
/**
 * validateRecord({
 *   idNumber, name, sex, dobDMY, issueDMY, expiryDMY
 * }, config?)
 */
function validateRecord(input, config = DEFAULT_RULE) {
  const idNumber = validateIdNumber(input.idNumber, config);
  const name = validateName(input.name, config);
  const sex = validateSex(input.sex);
  const { dobISO, issueISO, expiryISO } = validateDates({
    dobDMY: input.dobDMY, issueDMY: input.issueDMY, expiryDMY: input.expiryDMY
  }, config);

  return {
    ok: true,
    idNumber,
    name,
    sex,
    dobISO,
    issueISO,
    expiryISO
  };
}

/** Optional checksum gate (disabled by default) */
function enableChecksum({ enabled = false, algorithm = "luhn" } = {}) {
  return (idNumber) => {
    if (!enabled) return true;
    if (algorithm === "luhn") return luhnCheck(idNumber);
    return true;
  };
}

// ---------- performance improvements ----------
// Memoization for date parsing (cache frequently used dates)
const dateParseCache = new Map();
const MAX_CACHE_SIZE = 1000;

function parseDate(dateStr) {
  if (dateParseCache.has(dateStr)) {
    return dateParseCache.get(dateStr);
  }
  
  let result = null;
  for (const [format, regex] of Object.entries(DATE_FORMATS)) {
    const match = dateStr.match(regex);
    if (match) {
      let dd, mm, yyyy;
      if (format === 'yyyy-mm-dd') {
        [, yyyy, mm, dd] = match.map(Number);
      } else {
        [, dd, mm, yyyy] = match.map(Number);
      }
      result = { dd, mm, yyyy, format };
      break;
    }
  }
  
  // Cache management
  if (dateParseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = dateParseCache.keys().next().value;
    dateParseCache.delete(firstKey);
  }
  dateParseCache.set(dateStr, result);
  
  return result;
}

// Performance-optimized validation with early returns
function validateRecordFast(input, config = DEFAULT_RULE) {
  // Pre-validate input structure for performance
  if (!input || typeof input !== 'object') {
    throwSomaliError("Invalid input: must be an object", CODES.INVALID_INPUT);
  }
  
  const requiredFields = ['idNumber', 'name', 'sex', 'dobDMY', 'issueDMY', 'expiryDMY'];
  for (const field of requiredFields) {
    if (!(field in input)) {
      throwSomaliError(`Missing required field: ${field}`, CODES.MISSING_FIELD);
    }
  }
  
  // Use the regular validation but with optimized flow
  return validateRecord(input, config);
}

// Batch validation for performance
function validateBatch(records, config = DEFAULT_RULE) {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < records.length; i++) {
    try {
      const result = validateRecordFast(records[i], config);
      results.push({ index: i, success: true, data: result });
    } catch (error) {
      results.push({ 
        index: i, 
        success: false, 
        error: {
          message: error.message,
          code: error.code,
          somaliMessage: error.somaliMessage,
          arabicMessage: error.arabicMessage
        }
      });
      errors.push({ index: i, error });
    }
  }
  
  return {
    results,
    summary: {
      total: records.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      successRate: (results.filter(r => r.success).length / records.length * 100).toFixed(2) + '%'
    }
  };
}

// Multilingual validation function
function validateRecordMultilingual(input, config = DEFAULT_RULE, language = 'so') {
  try {
    return validateRecord(input, config);
  } catch (error) {
    // Enhance error with all language variants
    error.somaliMessage = SOMALI_MESSAGES[error.code];
    error.arabicMessage = ARABIC_MESSAGES[error.code];
    error.localizedMessage = getLocalizedMessage(error.code, language);
    
    throw error;
  }
}

module.exports = {
  // Core API
  DEFAULT_RULE,
  validateIdNumber,
  validateName,
  validateSex,
  validateDates,
  validateRecord,
  enableChecksum,
  maskId,
  redact,
  
  // Enhanced API (v0.2.0)
  validateRecordFast,
  validateBatch,
  validateRecordMultilingual,
  parseDate,
  isValidDate,
  toISOFromDate,
  
  // Multilingual support
  SUPPORTED_LANGUAGES,
  getLocalizedMessage,
  throwLocalizedError,
  
  // Error handling
  SomaliIdError,
  CODES,
  SOMALI_MESSAGES,
  ARABIC_MESSAGES,
  
  // Date formats
  DATE_FORMATS,
  
  // Legacy compatibility
  isValidDMY: isValidDate,
  toISOFromDMY: toISOFromDate
};
