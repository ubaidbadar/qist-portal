import { useQuery } from '@tanstack/react-query';
import type { Branch } from '@shop/shared';
import { Badge, Card } from '../../ui';
import ListSkeleton from '../../shared/list_skeleton';
import QueryView from '../../shared/query_view';
import SectionHeader from '../../shared/section_header';
import BranchDrawer from './branch_drawer';
import { branchesQuery } from './queries';

export default function BranchesTab() {
  const query = useQuery(branchesQuery);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Branches"
        description="Each branch has its own stock, sales and receipts. Customers are shared by all branches."
        action={<BranchDrawer />}
      />
      <QueryView query={query} skeleton={<ListSkeleton rows={2} />}>
        {(branches) => (
          <Card padding="none">
            <ul className="divide-y divide-border">
              {branches.map((branch) => (
                <BranchRow key={branch._id} branch={branch} />
              ))}
            </ul>
          </Card>
        )}
      </QueryView>
    </section>
  );
}

function BranchRow({ branch }: { branch: Branch }) {
  const details = [branch.phone, branch.address].filter(Boolean).join(' · ');

  return (
    <li className="flex items-center gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
          {branch.name}
          {!branch.active && (
            <Badge variant="warning" pill>
              Inactive
            </Badge>
          )}
        </p>
        {details && <p className="mt-0.5 truncate text-sm text-muted">{details}</p>}
      </div>
      <BranchDrawer branch={branch} />
    </li>
  );
}
