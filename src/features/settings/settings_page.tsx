import { useSearchParams } from 'react-router-dom';
import { Building2, CreditCard, FileCheck2, MapPin, NotebookTabs, Users } from 'lucide-react';
import { Select } from '../../ui';
import Page from '../../shared/page';
import BranchesTab from './branches_tab';
import OrganizationTab from './organization_tab';
import PaymentMethodsTab from './payment_methods_tab';
import PlansTab from './plans_tab';
import TeamTab from './team_tab';
import DocumentsTab from './documents_tab';

const SECTIONS = [
  {
    id: 'organization',
    label: 'Organization',
    group: 'BUSINESS',
    icon: Building2,
    component: OrganizationTab,
  },
  {
    id: 'payments',
    label: 'Payment methods',
    group: 'BUSINESS',
    icon: CreditCard,
    component: PaymentMethodsTab,
  },
  { id: 'branches', label: 'Branches', group: 'BUSINESS', icon: MapPin, component: BranchesTab },
  { id: 'plans', label: 'Installment plans', group: 'BUSINESS', icon: NotebookTabs, component: PlansTab },
  { id: 'documents', label: 'Documents', group: 'RECORDS', icon: FileCheck2, component: DocumentsTab },
  { id: 'team', label: 'Staff', group: 'TEAM', icon: Users, component: TeamTab },
];
/** The active section stays in the existing URL so old bookmarks continue to work. */
export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const active = SECTIONS.find((section) => section.id === params.get('tab')) ?? SECTIONS[0];
  const Content = active.component;
  const select = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    setParams(next);
  };
  return (
    <Page title="Settings" description="Manage your business and the way your team works.">
      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <div className="lg:hidden">
          <Select
            label="Settings section"
            value={active.id}
            onChange={(event) => select(event.target.value)}
            options={SECTIONS.map(({ id, label }) => ({ value: id, label }))}
          />
        </div>
        <nav aria-label="Settings" className="hidden space-y-6 lg:block">
          {['BUSINESS', 'RECORDS', 'TEAM'].map((group) => (
            <div key={group}>
              <p className="mb-2 px-3 text-xs font-medium tracking-wide text-muted">{group}</p>
              <ul className="space-y-1">
                {SECTIONS.filter((item) => item.group === group).map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      aria-current={active.id === id ? 'page' : undefined}
                      onClick={() => select(id)}
                      className={`relative flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm font-medium transition-colors ${active.id === id ? 'bg-primary/10 text-primary before:absolute before:-left-3 before:h-6 before:w-1 before:rounded-full before:bg-primary' : 'text-muted hover:bg-surface hover:text-ink'}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <section aria-label={active.label} className="min-w-0 space-y-6">
          <Content />
        </section>
      </div>
    </Page>
  );
}
