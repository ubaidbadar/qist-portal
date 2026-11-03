import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatCnic, type Customer, type Device } from '@shop/shared';
import { Button, Card } from '../../ui';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import Page from '../../shared/page';
import { customerQuery } from '../customers/queries';
import CustomerStep from './customer_step';
import DeviceStep from './device_step';
import TermsStep from './terms_step';

const STEPS = ['Customer', 'Phone', 'Terms & review'] as const;

interface SaleDraft {
  step: number;
  customer: Customer | null;
  device: Device | null;
  sellingBranchId: string | null;
}

/** Selling a phone: customer → phone → terms. `?customerId=` starts with the customer chosen (from their profile). */
export default function NewContractPage() {
  const presetId = useSearchParams()[0].get('customerId') ?? '';
  const preset = useQuery({ ...customerQuery(presetId), enabled: Boolean(presetId) });
  const { branchId: activeBranch, branches } = useActiveBranch();

  const [draft, setDraft] = useState<SaleDraft>({ step: 0, customer: null, device: null, sellingBranchId: null });
  const customer = draft.customer ?? preset.data ?? null;
  const branchId = draft.sellingBranchId ?? (activeBranch === ALL_BRANCHES ? (branches.length === 1 ? branches[0]._id : '') : activeBranch);
  const canContinue = draft.step === 0 ? Boolean(customer) : Boolean(branchId && draft.device?.branchId === branchId);

  return (
    <Page title="New contract" breadcrumbs={[{ label: 'Contracts', to: '/contracts' }, { label: 'New contract' }]}>
      <div className="space-y-6">
        <ol className="flex flex-wrap gap-2 text-sm">
          {STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={index === draft.step ? 'step' : undefined}
              className={`rounded-pill px-4 py-2 font-medium ${index === draft.step ? 'bg-brand-raised text-on-brand' : index < draft.step ? 'bg-success-100 text-success-800' : 'bg-border text-muted'}`}
            >
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        {customer && draft.step > 0 && (
          <Card padding="sm" className="text-sm text-body">
            <strong className="font-medium text-ink">{customer.fullName}</strong> · {formatCnic(customer.cnic)}
            {draft.device && draft.step > 1 && <> · {draft.device.brand} {draft.device.model} · IMEI {draft.device.imeis[0]}</>}
          </Card>
        )}

        {draft.step === 0 && <CustomerStep selected={customer} onSelect={(selected) => setDraft((previous) => ({ ...previous, customer: selected }))} />}
        {draft.step === 1 && (
          <DeviceStep
            branchId={branchId}
            onBranchChange={(id) => {
              setDraft((previous) => ({ ...previous, sellingBranchId: id, device: null }));
            }}
            selected={draft.device}
            onSelect={(selected) => setDraft((previous) => ({ ...previous, device: selected }))}
          />
        )}
        {customer && draft.device && branchId && (
          <div className={draft.step === 2 ? '' : 'hidden'}>
            <TermsStep key={draft.device._id} branchId={branchId} customer={customer} device={draft.device} />
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setDraft((previous) => ({ ...previous, step: previous.step - 1 }))} disabled={draft.step === 0}>
            Back
          </Button>
          {draft.step < 2 && (
            <Button onClick={() => setDraft((previous) => ({ ...previous, step: previous.step + 1 }))} disabled={!canContinue}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </Page>
  );
}
