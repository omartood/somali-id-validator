export interface Rule {
    idNumber: { length?: number; mustStart?: string | null; allowSpaces?: boolean };
    nameMaxLen: number;
    allowArabic: boolean;
    requireFutureExpiry: boolean;
  }
  export const DEFAULT_RULE: Rule;
  
  export type Sex = "Male" | "Female";
  export type Language = "en" | "so" | "ar";
  export type DateFormat = "dd-mm-yyyy" | "dd/mm/yyyy" | "yyyy-mm-dd" | "dd.mm.yyyy";
  
  export interface ParsedDate {
    dd: number;
    mm: number;
    yyyy: number;
    format: DateFormat;
  }
  
  export interface BatchResult {
    results: Array<{
      index: number;
      success: boolean;
      data?: any;
      error?: {
        message: string;
        code: string;
        somaliMessage?: string;
        arabicMessage?: string;
      };
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      successRate: string;
    };
  }
  
  // Core validation functions
  export function validateIdNumber(raw: string, cfg?: Rule): string;
  export function validateName(name: string, cfg?: Rule): string;
  export function validateSex(sex: string): Sex;
  export function validateDates(input: {
    dobDMY: string; issueDMY: string; expiryDMY: string;
  }, cfg?: Rule): { dobISO: string; issueISO: string; expiryISO: string; };
  
  export function validateRecord(input: {
    idNumber: string;
    name: string;
    sex: string;
    dobDMY: string;
    issueDMY: string;
    expiryDMY: string;
  }, cfg?: Rule): {
    ok: true;
    idNumber: string;
    name: string;
    sex: Sex;
    dobISO: string;
    issueISO: string;
    expiryISO: string;
  };
  
  // Enhanced validation functions (v0.2.0)
  export function validateRecordFast(input: {
    idNumber: string;
    name: string;
    sex: string;
    dobDMY: string;
    issueDMY: string;
    expiryDMY: string;
  }, cfg?: Rule): {
    ok: true;
    idNumber: string;
    name: string;
    sex: Sex;
    dobISO: string;
    issueISO: string;
    expiryISO: string;
  };
  
  export function validateBatch(records: Array<{
    idNumber: string;
    name: string;
    sex: string;
    dobDMY: string;
    issueDMY: string;
    expiryDMY: string;
  }>, cfg?: Rule): BatchResult;
  
  export function validateRecordMultilingual(input: {
    idNumber: string;
    name: string;
    sex: string;
    dobDMY: string;
    issueDMY: string;
    expiryDMY: string;
  }, cfg?: Rule, language?: Language): {
    ok: true;
    idNumber: string;
    name: string;
    sex: Sex;
    dobISO: string;
    issueISO: string;
    expiryISO: string;
  };
  
  // Date handling functions
  export function parseDate(dateStr: string): ParsedDate | null;
  export function isValidDate(dateStr: string): boolean;
  export function toISOFromDate(dateStr: string): string;
  
  // Utility functions
  export function enableChecksum(opts?: { enabled?: boolean; algorithm?: "luhn" | string }): (idNumber: string) => boolean;
  export function maskId(idDigits: string, show?: { head: number; tail: number }): string;
  export function redact<T extends Record<string, any>>(obj: T, fields?: string[]): T;
  
  // Multilingual support
  export function getLocalizedMessage(code: string, language?: Language): string | null;
  export function throwLocalizedError(englishMsg: string, code: string, customLocalizedMsg?: string, language?: Language): SomaliIdError;
  
  // Error handling
  export class SomaliIdError extends Error { 
    code: string; 
    somaliMessage?: string;
    arabicMessage?: string;
    localizedMessage?: string;
  }
  
  // Constants
  export const CODES: Record<string, string>;
  export const SOMALI_MESSAGES: Record<string, string>;
  export const ARABIC_MESSAGES: Record<string, string>;
  export const SUPPORTED_LANGUAGES: Record<Language, string>;
  export const DATE_FORMATS: Record<DateFormat, RegExp>;
  
  // Legacy compatibility
  export function isValidDMY(s: string): boolean;
  export function toISOFromDMY(dmy: string): string;
  