import { createContext, use } from 'react';
import { queryOptions } from '@tanstack/react-query';
import { can, type Me, type Permission } from '@shop/shared';
import { apiGet } from '../config/api';
import { ME_KEY } from './session';

export const meQuery = queryOptions({ queryKey: ME_KEY, queryFn: () => apiGet<Me>('/me') });

/** Provided by RequireAuth, so every signed-in screen can read the user without null checks. */
export const MeContext = createContext<Me | null>(null);

export function useMe(): Me {
  const me = use(MeContext);
  if (!me) throw new Error('useMe is only available inside RequireAuth');
  return me;
}

/** Hides what the user cannot do. The server enforces the same map regardless. */
export function useCan() {
  const { user } = useMe();
  return (permission: Permission) => can(user.role, permission);
}
