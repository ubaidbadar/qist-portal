import { Store } from 'lucide-react';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import { Select } from '../../ui';

/** Which branch the screens show. A single branch is just named; owners can also pick "All branches". */
export default function BranchSwitcher({ className = '' }: { className?: string }) {
  const { branchId, canSeeAll, branches, select } = useActiveBranch();

  if (branches.length <= 1) {
    return (
      <p className={`flex min-w-0 items-center gap-2 px-1 text-sm font-medium text-body ${className}`}>
        <Store size={16} className="shrink-0 text-muted" aria-hidden="true" />
        <span className="truncate">{branches[0]?.name ?? 'No branch'}</span>
      </p>
    );
  }

  const options = [
    ...(canSeeAll ? [{ value: ALL_BRANCHES, label: 'All branches' }] : []),
    ...branches.map((branch) => ({ value: branch._id, label: branch.name })),
  ];

  return (
    <div className={className}>
      <Select aria-label="Branch" options={options} value={branchId} onChange={(event) => select(event.target.value)} className="py-2 text-sm" />
    </div>
  );
}
