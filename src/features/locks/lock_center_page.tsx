import { useSearchParams } from 'react-router-dom';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import { Tabs } from '../../ui';
import Page from '../../shared/page';
import CommandList from './command_list';
import OverdueList from './overdue_list';

/** Who is late, which locks need approval, which wait for the phone, and what happened. Refreshes every 30 s. */
export default function LockCenterPage() {
  const { branchId } = useActiveBranch();
  const [params, setParams] = useSearchParams();
  const branch = branchId === ALL_BRANCHES ? undefined : branchId;

  return (
    <Page title="Lock Center">
      <Tabs
        activeTabId={params.get('tab') ?? 'overdue'}
        onChange={(tab) => setParams({ tab }, { replace: true })}
        tabs={[
          { id: 'overdue', label: 'Overdue', content: <OverdueList branchId={branch} /> },
          { id: 'proposed', label: 'To approve', content: <CommandList status="proposed" branchId={branch} emptyTitle="Nothing to approve" emptyText="Locks the system proposes appear here at the lock hour." /> },
          { id: 'pending', label: 'Waiting for phone', content: <CommandList status="pending" branchId={branch} emptyTitle="Nothing waiting" emptyText="Approved locks, unlocks and releases wait here until the phone app picks them up." /> },
          { id: 'history', label: 'History', content: <CommandList branchId={branch} emptyTitle="No lock activity yet" emptyText="Every lock, unlock and release will be listed here." /> },
        ]}
      />
    </Page>
  );
}
