import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { type Customer, type Device } from '@shop/shared';
import { Button, Card } from '../../ui';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import ListSkeleton from '../../shared/list_skeleton';
import { customerQuery } from '../customers/queries';
import CustomerStep from './customer_step';
import DeviceStep from './device_step';
import SaleProgress from './sale_progress';
import SaleSummary from './sale_summary';
import TermsStep from './terms_step';

const STEP_COPY = [
  { title: 'Choose a customer', description: 'Find an existing customer or add someone new to this sale.' },
  { title: 'Choose a phone', description: 'Select an available phone from the selling branch or add it to stock.' },
  { title: 'Set payment terms', description: 'Confirm the price, down payment, and installment schedule before creating the contract.' },
] as const;

interface SaleDraft {
  step: number;
  customer: Customer | null;
  device: Device | null;
  sellingBranchId: string | null;
}

/** One uninterrupted sale: customer, stock phone, and installment terms. */
export default function NewContractPage() {
  const presetId = useSearchParams()[0].get('customerId') ?? '';
  const preset = useQuery({ ...customerQuery(presetId), enabled: Boolean(presetId) });
  const { branchId: activeBranch, branches } = useActiveBranch();
  const [draft, setDraft] = useState<SaleDraft>({ step: 0, customer: null, device: null, sellingBranchId: null });

  const customer = draft.customer ?? preset.data ?? null;
  const branchId = draft.sellingBranchId ?? (activeBranch === ALL_BRANCHES ? (branches.length === 1 ? branches[0]._id : '') : activeBranch);
  const branchName = branches.find((branch) => branch._id === branchId)?.name ?? null;
  const canContinue = draft.step === 0 ? Boolean(customer) : Boolean(branchId && draft.device?.branchId === branchId);
  const copy = STEP_COPY[draft.step];

  if (presetId && !preset.data) {
    return <Page title="New contract"><QueryView query={preset} skeleton={<ListSkeleton rows={3} />}>{() => null}</QueryView></Page>;
  }

  return (
    <Page title="New contract" description="Choose a customer and a phone, then review the installment terms." breadcrumbs={[{ label: 'Contracts', to: '/contracts' }, { label: 'New contract' }]}>
      <div className="mx-auto max-w-6xl space-y-5">
        <p className="text-sm leading-relaxed text-muted sm:text-base">
          Complete a new installment sale in three simple steps.
        </p>

        <SaleProgress current={draft.step} onBack={(step) => setDraft((previous) => ({ ...previous, step }))} />

        <div className={`grid items-start gap-5 ${draft.step < 2 ? 'lg:grid-cols-[minmax(0,1fr)_18rem]' : ''}`}>
          <Card padding="none" className="min-w-0">
            <header className="border-b border-border px-5 py-5 sm:px-7 sm:py-6">
              <p className="mb-1 text-xs font-semibold tracking-wide text-accent">
                Step {draft.step + 1} of 3
              </p>
              <h2 className="text-xl font-semibold text-ink sm:text-2xl">{copy.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{copy.description}</p>
            </header>

            <div className="min-w-0 px-5 py-6 sm:px-7">
              {draft.step === 0 && (
                <CustomerStep
                  selected={customer}
                  onSelect={(selected) => setDraft((previous) => ({ ...previous, customer: selected }))}
                />
              )}
              {draft.step === 1 && (
                <DeviceStep
                  branchId={branchId}
                  onBranchChange={(id) => setDraft((previous) => ({ ...previous, sellingBranchId: id, device: null }))}
                  selected={draft.device}
                  onSelect={(selected) => setDraft((previous) => ({ ...previous, device: selected }))}
                />
              )}
              {customer && draft.device && branchId && (
                <div className={draft.step === 2 ? '' : 'hidden'}>
                  <TermsStep key={draft.device._id} branchId={branchId} customer={customer} device={draft.device} />
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-canvas/50 px-5 py-4 sm:px-7">
              {draft.step > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => setDraft((previous) => ({ ...previous, step: previous.step - 1 }))}
                >
                  Back
                </Button>
              ) : (
                <span className="text-xs text-muted">Select a customer to continue</span>
              )}
              {draft.step < 2 && (
                <Button
                  onClick={() => setDraft((previous) => ({ ...previous, step: previous.step + 1 }))}
                  disabled={!canContinue}
                >
                  Continue
                </Button>
              )}
            </footer>
          </Card>

          {draft.step < 2 && (
            <SaleSummary customer={customer} device={draft.device} branchName={branchName} />
          )}
        </div>
      </div>
    </Page>
  );
}
