import axios, { type AxiosRequestConfig } from 'axios';
import type { ApiSuccess } from '@shop/shared';
import { getAccessToken, refreshSession } from '../auth/session';
import { API_BASE_URL } from './urls';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Sign-in and email-link calls: their 401 means wrong credentials, not an expired session. */
    skipAuthRefresh?: boolean;
    /** Marks the single retry after a refresh, so a request is never retried twice. */
    retried?: boolean;
  }
}

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired access token: refresh once, then repeat the request with the new token.
api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error;
  if (error.config.skipAuthRefresh || error.config.retried) throw error;
  await refreshSession();
  return api({ ...error.config, retried: true });
});

/** The API wraps every success in `{ data }`; these return what's inside. */
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig) => (await api.get<ApiSuccess<T>>(url, config)).data.data;

export const apiPost = async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
  (await api.post<ApiSuccess<T>>(url, body, config)).data.data;

export const apiPatch = async <T>(url: string, body?: unknown) => (await api.patch<ApiSuccess<T>>(url, body)).data.data;

export default api;
