import { describe, expect, test } from 'bun:test';
import { cnicSchema, formatCnic, formatMobile, imeiSchema, isValidImei, mobileSchema, optionalMobileSchema } from './identifiers';

describe('CNIC', () => {
  test('accepts dashes or plain digits and stores digits', () => {
    expect(cnicSchema.parse('35202-1234567-1')).toBe('3520212345671');
    expect(cnicSchema.parse(' 3520212345671 ')).toBe('3520212345671');
    expect(formatCnic('3520212345671')).toBe('35202-1234567-1');
  });

  test('rejects anything but 13 digits', () => {
    expect(cnicSchema.safeParse('35202-1234567').success).toBe(false);
    expect(cnicSchema.safeParse('35202-123456A-1').success).toBe(false);
  });
});

describe('mobile numbers', () => {
  test('local, international and spaced forms become 03XXXXXXXXX', () => {
    expect(mobileSchema.parse('0300 1234567')).toBe('03001234567');
    expect(mobileSchema.parse('+92 300 1234567')).toBe('03001234567');
    expect(mobileSchema.parse('923001234567')).toBe('03001234567');
    expect(formatMobile('03001234567')).toBe('0300 1234567');
  });

  test('landlines and short numbers are rejected; the optional form allows empty', () => {
    expect(mobileSchema.safeParse('042 35761234').success).toBe(false);
    expect(mobileSchema.safeParse('0300 12345').success).toBe(false);
    expect(optionalMobileSchema.parse('')).toBe('');
    expect(optionalMobileSchema.parse('0321-7654321')).toBe('03217654321');
  });
});

describe('IMEI', () => {
  test('the Luhn check digit must match', () => {
    expect(isValidImei('490154203237518')).toBe(true);
    expect(isValidImei('490154203237517')).toBe(false);
    expect(isValidImei('49015420323751')).toBe(false);
  });

  test('spaces and dashes are ignored', () => {
    expect(imeiSchema.parse('49-015420-323751-8')).toBe('490154203237518');
    expect(imeiSchema.safeParse('123456789012345').success).toBe(false);
  });
});
