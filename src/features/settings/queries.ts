import { queryOptions } from '@tanstack/react-query';
import type { Branch, Org, User } from '@shop/shared';
import { apiGet } from '../../config/api';

export const orgQuery = queryOptions({ queryKey: ['org'], queryFn: () => apiGet<Org>('/org') });
export const branchesQuery = queryOptions({ queryKey: ['branches'], queryFn: () => apiGet<Branch[]>('/branches') });
export const membersQuery = queryOptions({ queryKey: ['members'], queryFn: () => apiGet<User[]>('/users') });
