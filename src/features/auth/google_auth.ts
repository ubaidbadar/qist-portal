import { queryOptions } from '@tanstack/react-query';
import type { GoogleAuthConfig, GoogleProfile } from '@shop/shared';
import { apiGet } from '../../config/api';

const PENDING_GOOGLE_AUTH_KEY = 'qist_google_onboarding';
const PENDING_TTL_MS = 15 * 60 * 1000;

export interface PendingGoogleAuth {
  credential: string;
  profile: GoogleProfile;
}

export const googleAuthConfigQuery = queryOptions({
  queryKey: ['auth', 'google-config'],
  queryFn: () => apiGet<GoogleAuthConfig>('/auth/google/config', { skipAuthRefresh: true }),
  staleTime: Infinity,
});

/** Keep the short-lived Google ID token out of the URL and clear it as soon as onboarding completes. */
export function savePendingGoogleAuth(value: PendingGoogleAuth): boolean {
  try {
    sessionStorage.setItem(PENDING_GOOGLE_AUTH_KEY, JSON.stringify({ ...value, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function getPendingGoogleAuth(): PendingGoogleAuth | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(PENDING_GOOGLE_AUTH_KEY) ?? 'null');
    if (
      typeof value === 'object' &&
      value !== null &&
      'savedAt' in value &&
      typeof value.savedAt === 'number' &&
      Date.now() >= value.savedAt &&
      Date.now() - value.savedAt <= PENDING_TTL_MS &&
      'credential' in value &&
      typeof value.credential === 'string' &&
      'profile' in value &&
      typeof value.profile === 'object' &&
      value.profile !== null &&
      'fullName' in value.profile &&
      typeof value.profile.fullName === 'string' &&
      'email' in value.profile &&
      typeof value.profile.email === 'string'
    ) {
      return { credential: value.credential, profile: { fullName: value.profile.fullName, email: value.profile.email } };
    }
    clearPendingGoogleAuth();
    return null;
  } catch {
    return null;
  }
}

export function clearPendingGoogleAuth() {
  try {
    sessionStorage.removeItem(PENDING_GOOGLE_AUTH_KEY);
  } catch {
    // The next sign-in will replace this short-lived state.
  }
}
