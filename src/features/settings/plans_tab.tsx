import { useQuery } from '@tanstack/react-query';
import { CalendarRange } from 'lucide-react';
import type { InstallmentPlan } from '@shop/shared';
import { Badge, Card, EmptyState } from '../../ui';
import ListSkeleton from '../../shared/list_skeleton';
import { scheduleLabel } from '../../shared/labels';
import QueryView from '../../shared/query_view';
import SectionHeader from '../../shared/section_header';
import { plansQuery } from '../contracts/queries';
import PlanDrawer from './plan_drawer';

export default function PlansTab() {
  const query = useQuery(plansQuery);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Installment plans"
        description="Ready-made terms every branch sells on. Changing a plan affects new sales only."
        action={<PlanDrawer />}
      />
      <QueryView query={query} skeleton={<ListSkeleton rows={2} />}>
        {(plans) =>
          plans.length === 0 ? (
            <Card padding="none">
              <EmptyState icon={CalendarRange} title="No plans yet" description="Add your usual terms, e.g. 6 months at 25%. Staff can still enter terms by hand." />
            </Card>
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-border">
                {plans.map((plan) => (
                  <PlanRow key={plan._id} plan={plan} />
                ))}
              </ul>
            </Card>
          )
        }
      </QueryView>
    </section>
  );
}

function PlanRow({ plan }: { plan: InstallmentPlan }) {
  return (
    <li className={`flex items-center gap-3 px-5 py-4 ${plan.active ? '' : 'opacity-60'}`}>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium text-ink">
          {plan.name}
          {!plan.active && <Badge variant="neutral" pill>Inactive</Badge>}
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {scheduleLabel(plan.count, plan.frequency)} · {plan.markupPercent}% markup
          {plan.minDownPaymentPercent > 0 && ` · at least ${plan.minDownPaymentPercent}% down`}
        </p>
      </div>
      <PlanDrawer plan={plan} />
    </li>
  );
}
