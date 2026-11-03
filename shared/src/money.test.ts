import { describe, expect, test } from 'bun:test';
import { toPaisa } from './money';

describe('toPaisa', () => {
  test('converts rupees to integer paisa', () => {
    expect(toPaisa(12500)).toBe(1_250_000);
    expect(toPaisa(0)).toBe(0);
  });

  test('rounds away binary floating point noise', () => {
    expect(toPaisa(0.1 + 0.2)).toBe(30);
    expect(toPaisa(19.99)).toBe(1999);
  });
});
