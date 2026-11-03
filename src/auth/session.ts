import axios from 'axios';
import type { ApiSuccess, Me, Session } from '@shop/shared';
import { queryClient } from '../app/query_client';
import { API_BASE_URL } from '../config/urls';
import { createStore } from '../utils/store';
import { loadActiveBranch } from './active_branch';

export type SessionStatus = 'loading' | 'signed_in' | 'signed_out';

interface SessionState {
  status: SessionStatus;
  /** Kept in memory only; a reload gets a new one from the httpOnly refresh cookie. */
  accessToken: string | null;
}

export const ME_KEY = ['me'] as const;
const RACE_RETRY_DELAY_MS = 300;
const SESSION_STORAGE_KEY = 'qist_session';

interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  user: Me['user'];
  org: Me['org'];
  branches: Me['branches'];
}

function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonStr) as { exp?: number };
  } catch {
    return null;
  }
}

function isJwtExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const payload = parseJwtPayload(token);
  return !payload?.exp || payload.exp * 1000 <= Date.now() + 30_000;
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: StoredSession | null) {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // localStorage might be unavailable or disabled
  }
}

function initSession(): SessionState {
  const stored = getStoredSession();
  if (stored && !isJwtExpired(stored.accessToken)) {
    queryClient.setQueryData<Me>(ME_KEY, { user: stored.user, org: stored.org, branches: stored.branches });
    loadActiveBranch(stored.user._id);
    return { status: 'signed_in', accessToken: stored.accessToken };
  }
  return { status: 'loading', accessToken: null };
}

export const sessionStore = createStore<SessionState>(initSession());

export const getAccessToken = () => sessionStore.get().accessToken;

export function signIn({ accessToken, refreshToken, ...me }: Session) {
  const existingStored = getStoredSession();
  const effectiveRefreshToken = refreshToken || existingStored?.refreshToken;
  saveStoredSession({
    accessToken,
    refreshToken: effectiveRefreshToken,
    user: me.user,
    org: me.org,
    branches: me.branches,
  });
  queryClient.setQueryData<Me>(ME_KEY, me);
  loadActiveBranch(me.user._id);
  sessionStore.set({ status: 'signed_in', accessToken });
}

export function signOut() {
  saveStoredSession(null);
  sessionStore.set({ status: 'signed_out', accessToken: null });
  queryClient.clear();
}

// Its own client: the main client's interceptor calls refreshSession, which must not loop back into it.
const authClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
const postRefresh = async () => {
  const stored = getStoredSession();
  const body = stored?.refreshToken ? { refreshToken: stored.refreshToken } : undefined;
  const res = await authClient.post<ApiSuccess<Session>>('/auth/refresh', body);
  return res.data.data;
};
const isAuthFailure = (err: unknown) => axios.isAxiosError(err) && [401, 403].includes(err.response?.status ?? 0);

async function requestRefresh() {
  try {
    return await postRefresh();
  } catch (err) {
    // Another tab may have rotated the shared cookie a moment ago; the browser now holds the new one.
    if (!isAuthFailure(err) || sessionStore.get().status !== 'signed_in') throw err;
    await new Promise((resolve) => setTimeout(resolve, RACE_RETRY_DELAY_MS));
    return postRefresh();
  }
}

let refreshing: Promise<void> | null = null;

/** A new access token from the refresh cookie. Requests that fail together share one refresh. */
export function refreshSession() {
  refreshing ??= requestRefresh()
    .then(signIn)
    .catch((err: unknown) => {
      if (isAuthFailure(err)) signOut(); // the session is over; a network error is not
      throw err;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/** On page load: resume the session if the refresh cookie is still valid, otherwise show sign-in. */
export const restoreSession = async () => {
  const current = sessionStore.get();
  // If already signed in with a valid token from storage, attempt a quiet background refresh
  if (current.status === 'signed_in' && !isJwtExpired(current.accessToken)) {
    try {
      const newSession = await requestRefresh();
      signIn(newSession);
    } catch {
      // Quietly ignore background refresh failure: user stays signed in with current valid access token
    }
    return;
  }

  // Token is expired or not present: perform normal refresh
  try {
    await refreshSession();
  } catch {
    if (sessionStore.get().status === 'loading') {
      signOut();
    }
  }
};

export async function logOut() {
  try {
    const stored = getStoredSession();
    const body = stored?.refreshToken ? { refreshToken: stored.refreshToken } : undefined;
    await authClient.post('/auth/logout', body);
  } finally {
    signOut();
  }
}
