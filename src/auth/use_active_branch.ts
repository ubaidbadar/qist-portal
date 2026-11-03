import { can } from '@shop/shared';
import { useStore } from '../utils/store';
import { ALL_BRANCHES, activeBranchStore, setActiveBranch } from './active_branch';
import { useMe } from './me';

/** The branch the user is working in. A stale or foreign choice falls back to a valid one. */
export function useActiveBranch() {
  const { user, branches } = useMe();
  const stored = useStore(activeBranchStore);
  const canSeeAll = can(user.role, 'branches.all');
  const isValid = stored === ALL_BRANCHES ? canSeeAll : branches.some((branch) => branch._id === stored);
  const fallback = canSeeAll ? ALL_BRANCHES : (branches[0]?._id ?? ALL_BRANCHES);

  return {
    branchId: stored && isValid ? stored : fallback,
    canSeeAll,
    branches,
    select: (branchId: string) => setActiveBranch(user._id, branchId),
  };
}
