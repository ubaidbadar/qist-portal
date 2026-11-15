// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { clearPendingGoogleAuth, getPendingGoogleAuth, savePendingGoogleAuth } from '../src/features/auth/google_auth';

afterEach(() => clearPendingGoogleAuth());

describe('pending Google onboarding', () => {
  it('stores the short-lived credential and verified profile without putting either in the URL', () => {
    const pending = {
      credential: 'short-lived-google-id-token',
      profile: { fullName: 'Ayesha Khan', email: 'ayesha@example.com' },
    };

    expect(savePendingGoogleAuth(pending)).toBe(true);
    expect(getPendingGoogleAuth()).toEqual(pending);
    expect(window.location.search).toBe('');
  });

  it('clears the credential after onboarding or when the user starts over', () => {
    savePendingGoogleAuth({
      credential: 'short-lived-google-id-token',
      profile: { fullName: 'Ayesha Khan', email: 'ayesha@example.com' },
    });

    clearPendingGoogleAuth();

    expect(getPendingGoogleAuth()).toBeNull();
  });
});
