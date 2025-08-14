const { SomaliIdError, CODES, SOMALI_MESSAGES } = require("./errors");

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

// Helper to throw errors with both English and Somali messages
function throwSomaliError(englishMsg, code, customSomaliMsg = null) {
  const somaliMsg = customSomaliMsg || SOMALI_MESSAGES[code];
  throw new SomaliIdError(englishMsg, code, somaliMsg);
}

// dd-mm-yyyy validation
function isValidDMY(s) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(s)) return false;
  const [dd, mm, yyyy] = s.split("-").map(Number);
  if (yyyy < 1900 || yyyy > 2100) return false;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  return d.getUTCFullYear() === yyyy && d.getUTCMonth() === mm - 1 && d.getUTCDate() === dd;
}
function toISOFromDMY(dmy) {
  const [dd, mm, yyyy] = dmy.split("-").map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd)).toISOString();
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
      `${label} must be dd-mm-yyyy`, 
      CODES.INVALID_DATE,
      `${somaliLabel} waa inay noqoto qaabka dd-mm-yyyy`
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

module.exports = {
  DEFAULT_RULE,
  validateIdNumber,
  validateName,
  validateSex,
  validateDates,
  validateRecord,
  enableChecksum,
  maskId,
  redact,
  SomaliIdError,
  CODES,
  SOMALI_MESSAGES
};
