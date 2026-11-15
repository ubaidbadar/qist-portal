import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { clearPendingGoogleAuth, getPendingGoogleAuth, savePendingGoogleAuth } from '../src/features/auth/google_auth';

const values = new Map<string, string>();

beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
});

afterEach(() => clearPendingGoogleAuth());

describe('pending Google onboarding', () => {
  test('stores the short-lived credential and verified profile in session storage', () => {
    const pending = {
      credential: 'short-lived-google-id-token',
      profile: { fullName: 'Ayesha Khan', email: 'ayesha@example.com' },
    };

    expect(savePendingGoogleAuth(pending)).toBe(true);
    expect(getPendingGoogleAuth()).toEqual(pending);
  });

  test('rejects stale Google identity tokens before onboarding', () => {
    const pending = {
      credential: 'expired-id-token',
      profile: { fullName: 'Ayesha Khan', email: 'ayesha@example.com' },
      savedAt: Date.now() - 20 * 60 * 1000,
    };
    sessionStorage.setItem('qist_google_onboarding', JSON.stringify(pending));
    expect(getPendingGoogleAuth()).toBeNull();
  });

  test('clears the credential after onboarding or when the user starts over', () => {
    savePendingGoogleAuth({
      credential: 'short-lived-google-id-token',
      profile: { fullName: 'Ayesha Khan', email: 'ayesha@example.com' },
    });

    clearPendingGoogleAuth();

    expect(getPendingGoogleAuth()).toBeNull();
  });
});
