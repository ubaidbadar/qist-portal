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

export const sessionStore = createStore<SessionState>({ status: 'loading', accessToken: null });

export const getAccessToken = () => sessionStore.get().accessToken;

export function signIn({ accessToken, ...me }: Session) {
  queryClient.setQueryData<Me>(ME_KEY, me);
  loadActiveBranch(me.user._id);
  sessionStore.set({ status: 'signed_in', accessToken });
}

export function signOut() {
  sessionStore.set({ status: 'signed_out', accessToken: null });
  queryClient.clear();
}

// Its own client: the main client's interceptor calls refreshSession, which must not loop back into it.
const authClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
const postRefresh = async () => (await authClient.post<ApiSuccess<Session>>('/auth/refresh')).data.data;
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
export const restoreSession = () =>
  refreshSession().catch(() => {
    if (sessionStore.get().status === 'loading') signOut();
  });

export async function logOut() {
  try {
    await authClient.post('/auth/logout');
  } finally {
    signOut();
  }
}
