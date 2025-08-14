export interface Rule {
    idNumber: { length?: number; mustStart?: string | null; allowSpaces?: boolean };
    nameMaxLen: number;
    allowArabic: boolean;
    requireFutureExpiry: boolean;
  }
  export const DEFAULT_RULE: Rule;
  
  export type Sex = "Male" | "Female";
  
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
  
  export function enableChecksum(opts?: { enabled?: boolean; algorithm?: "luhn" | string }): (idNumber: string) => boolean;
  
  export function maskId(idDigits: string, show?: { head: number; tail: number }): string;
  export function redact<T extends Record<string, any>>(obj: T, fields?: string[]): T;
  
  export class SomaliIdError extends Error { 
    code: string; 
    somaliMessage?: string;
  }
  export const CODES: Record<string,string>;
  export const SOMALI_MESSAGES: Record<string,string>;
  