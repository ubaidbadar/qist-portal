import { useQuery } from '@tanstack/react-query';
import { Card } from '../../ui';
import ListSkeleton from '../../shared/list_skeleton';
import QueryView from '../../shared/query_view';
import SectionHeader from '../../shared/section_header';
import MemberDrawer from './member_drawer';
import MemberRow from './member_row';
import { teamQuery } from './queries';

export default function TeamTab() {
  const query = useQuery(teamQuery);
  const branches = query.data?.branches ?? [];
  const activeBranches = branches.filter((branch) => branch.active);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Team"
        description="Managers and staff work only in the branches you give them."
        action={<MemberDrawer branches={activeBranches} />}
      />
      <QueryView query={query} skeleton={<ListSkeleton rows={3} />}>
        {(loaded) => (
          <Card padding="none">
            <ul className="divide-y divide-border">
              {loaded.members.map((member) => (
                <MemberRow key={member._id} member={member} branches={branches} activeBranches={activeBranches} />
              ))}
            </ul>
          </Card>
        )}
      </QueryView>
    </section>
  );
}
