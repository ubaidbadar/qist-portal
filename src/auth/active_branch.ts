import { createStore } from '../utils/store';

/** "all" (owners only) or a branch id. Lists filter by it from M2 on. */
export const ALL_BRANCHES = 'all';

const storageKey = (userId: string) => `shop_branch_${userId}`;

export const activeBranchStore = createStore<string | null>(null);

/** Restores the user's last choice when they sign in on this browser. */
export const loadActiveBranch = (userId: string) => activeBranchStore.set(localStorage.getItem(storageKey(userId)));

export function setActiveBranch(userId: string, branchId: string) {
  localStorage.setItem(storageKey(userId), branchId);
  activeBranchStore.set(branchId);
}
