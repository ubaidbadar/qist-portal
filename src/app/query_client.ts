import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from '../ui';
import getAxiosMessage from '../utils/get_axios_message';

const STALE_MS = 30_000;


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      // A visit makes at most one automatic read; recovery is an explicit Retry action.
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
  // Button-triggered mutations report failures as a toast. Forms show errors in place, so they don't use this.
  mutationCache: new MutationCache({
    onError: (error) => toast.error(getAxiosMessage(error)),
  }),
});
