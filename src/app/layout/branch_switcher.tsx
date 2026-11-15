import { Store } from 'lucide-react';
import { ALL_BRANCHES, useActiveBranch, useMe } from '../../auth';
import { orgLogoUrl } from '../../utils/org_logo_url';
import { Select } from '../../ui';

interface BranchSwitcherProps {
  className?: string;
  compact?: boolean;
}

/** Shop identity plus the active branch. Owners can switch between branches or view them all. */
export default function BranchSwitcher({ className = '', compact = false }: BranchSwitcherProps) {
  const { org } = useMe();
  const { branchId, canSeeAll, branches, select } = useActiveBranch();
  const logoUrl = orgLogoUrl(org);

  const options = [
    ...(canSeeAll ? [{ value: ALL_BRANCHES, label: 'All branches' }] : []),
    ...branches.map((branch) => ({ value: branch._id, label: branch.name })),
  ];

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      {!compact && (
        logoUrl ? (
          <img src={logoUrl} alt="" className="size-9 shrink-0 rounded-control border border-border bg-surface object-contain" />
        ) : (
          <span className="grid size-9 shrink-0 place-items-center rounded-control border border-border bg-surface text-muted">
            <Store size={17} aria-hidden="true" />
          </span>
        )
      )}
      <div className="min-w-0 flex-1">
        {!compact && <p className="truncate text-sm font-semibold text-ink">{org.name}</p>}
        {branches.length <= 1 ? (
          <p className={compact ? 'truncate text-sm font-medium text-body' : 'truncate text-xs text-muted'}>
            {branches[0]?.name ?? 'No branch'}
          </p>
        ) : (
          <Select
            aria-label="Branch"
            options={options}
            value={branchId}
            onChange={(event) => select(event.target.value)}
            className={compact ? 'py-1.5 text-sm' : 'mt-0.5 py-1.5 text-xs'}
          />
        )}
      </div>
    </div>
  );
}
