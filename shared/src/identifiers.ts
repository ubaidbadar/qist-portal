import { z } from 'zod';

/**
 * Pakistani identity numbers, stored as digits only and formatted for display. Each schema accepts the forms
 * people actually type (dashes, spaces, +92) and outputs the stored form.
 */

/** "35202-1234567-1" or "3520212345671" → "3520212345671". */
export const cnicSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\d{13}$/, 'Enter the 13-digit CNIC, e.g. 35202-1234567-1'));

export const formatCnic = (cnic: string) => `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12)}`;

/** "0300 1234567", "+92 300 1234567" or "923001234567" → "03001234567". */
export function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('92') ? `0${digits.slice(2)}` : digits;
}

const MOBILE_MESSAGE = 'Enter a mobile number like 0300 1234567';

export const mobileSchema = z.string().trim().transform(normalizeMobile).pipe(z.string().regex(/^03\d{9}$/, MOBILE_MESSAGE));

/** A mobile number, or an empty string for "none". */
export const optionalMobileSchema = z
  .string()
  .trim()
  .transform((value) => (value === '' ? '' : normalizeMobile(value)))
  .pipe(z.string().regex(/^(03\d{9})?$/, MOBILE_MESSAGE));

export const formatMobile = (mobile: string) => (mobile ? `${mobile.slice(0, 4)} ${mobile.slice(4)}` : '');

/** 15 digits whose last digit is a Luhn check digit (what *#06# shows on the phone). */
export function isValidImei(imei: string) {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let position = 0; position < imei.length; position += 1) {
    let digit = Number(imei[imei.length - 1 - position]);
    if (position % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export const imeiSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .pipe(z.string().refine(isValidImei, 'Check the IMEI: 15 digits, as shown by dialing *#06#'));
