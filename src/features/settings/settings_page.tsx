import { useSearchParams } from 'react-router-dom';
import { Tabs } from '../../ui';
import Page from '../../shared/page';
import BranchesTab from './branches_tab';
import OrganizationTab from './organization_tab';
import PlansTab from './plans_tab';
import TeamTab from './team_tab';

const DEFAULT_TAB = 'organization';

/** Owner only. The open tab lives in the URL (`?tab=team`), so it survives a reload and can be linked to. */
export default function SettingsPage() {
  const [params, setParams] = useSearchParams();

  return (
    <Page title="Settings" description="Manage your organization, branches, team, and installment plans.">
      <Tabs
        activeTabId={params.get('tab') ?? DEFAULT_TAB}
        onChange={(tab) => setParams({ tab }, { replace: true })}
        tabs={[
          { id: 'organization', label: 'Organization', content: <OrganizationTab /> },
          { id: 'branches', label: 'Branches', content: <BranchesTab /> },
          { id: 'team', label: 'Team', content: <TeamTab /> },
          { id: 'plans', label: 'Installment plans', content: <PlansTab /> },
        ]}
      />
    </Page>
  );
}
