import { MutationCache, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '../ui';
import getAxiosMessage from '../utils/get_axios_message';

const STALE_MS = 30_000;
const MAX_RETRIES = 2;

// A 4xx answer won't change on retry; network failures and 5xx get two more tries.
const isClientError = (error: unknown) => axios.isAxiosError(error) && (error.response?.status ?? 500) < 500;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      retry: (failureCount, error) => !isClientError(error) && failureCount < MAX_RETRIES,
    },
  },
  // Button-triggered mutations report failures as a toast. Forms show errors in place, so they don't use this.
  mutationCache: new MutationCache({
    onError: (error) => toast.error(getAxiosMessage(error)),
  }),
});
