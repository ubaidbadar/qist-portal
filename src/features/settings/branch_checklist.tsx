import { useId } from 'react';
import type { Branch } from '@shop/shared';
import { Checkbox } from '../../ui';

interface BranchChecklistProps {
  branches: Branch[];
  value: string[];
  onChange: (branchIds: string[]) => void;
  error?: string;
}

/** Pick the branches a team member works in. */
export default function BranchChecklist({ branches, value, onChange, error }: BranchChecklistProps) {
  const errorId = useId();
  const toggle = (branchId: string, checked: boolean) =>
    onChange(checked ? [...value, branchId] : value.filter((id) => id !== branchId));

  return (
    <fieldset aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
      <legend className="mb-1.5 text-sm font-medium text-body">Branches</legend>
      <div className="space-y-3 rounded-control border border-border bg-surface p-4">
        {branches.map((branch) => (
          <Checkbox
            key={branch._id}
            label={branch.name}
            checked={value.includes(branch._id)}
            onChange={(event) => toggle(branch._id, event.target.checked)}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
