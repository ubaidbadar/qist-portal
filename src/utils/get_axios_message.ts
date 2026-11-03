import axios from 'axios';
import type { ApiFailure } from '@shop/shared';

const NETWORK_MESSAGE = "Can't reach the server. Check your internet connection and try again.";

export interface FieldError {
  path: string;
  message: string;
}

const apiErrorOf = (err: unknown) =>
  axios.isAxiosError(err) ? (err.response?.data as Partial<ApiFailure> | undefined)?.error : undefined;

/** A message a person can act on, from any error the API client throws (the API's messages are written for people). */
export default function getAxiosMessage(err: unknown): string {
  if (axios.isAxiosError(err) && !err.response) return NETWORK_MESSAGE;
  const apiError = apiErrorOf(err);
  if (apiError?.message) return apiError.message;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string') return err;
  return 'Something went wrong!';
}

/** Extra facts the API attached to an error, e.g. `customerId` when a CNIC is already registered. */
export const getErrorDetails = (err: unknown) => apiErrorOf(err)?.details as Record<string, unknown> | undefined;

/** Problems tied to form fields: the API sends them as `details: { fields: [{ path, message }] }`. */
export function getFieldErrors(err: unknown): FieldError[] {
  const fields = (apiErrorOf(err)?.details as { fields?: unknown } | undefined)?.fields;
  if (!Array.isArray(fields)) return [];
  return fields.filter(
    (field): field is FieldError => typeof field?.path === 'string' && typeof field?.message === 'string',
  );
}
