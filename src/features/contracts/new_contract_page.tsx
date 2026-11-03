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

const STEPS = ['Customer', 'Phone', 'Terms'] as const;

/** Selling a phone: customer → phone → terms. `?customerId=` starts with the customer chosen (from their profile). */
export default function NewContractPage() {
  const presetId = useSearchParams()[0].get('customerId') ?? '';
  const preset = useQuery({ ...customerQuery(presetId), enabled: Boolean(presetId) });
  const { branchId: activeBranch, branches } = useActiveBranch();

  const [step, setStep] = useState(0);
  const [chosenCustomer, setChosenCustomer] = useState<Customer | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [chosenBranch, setChosenBranch] = useState<string | null>(null);
  const customer = chosenCustomer ?? preset.data ?? null;
  const branchId = chosenBranch ?? (activeBranch === ALL_BRANCHES ? (branches[0]?._id ?? '') : activeBranch);
  const canContinue = step === 0 ? Boolean(customer) : Boolean(device);

  return (
    <Page title="New contract" breadcrumbs={[{ label: 'Contracts', to: '/contracts' }, { label: 'New contract' }]}>
      <div className="space-y-6">
        <ol className="flex flex-wrap gap-2 text-sm">
          {STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={index === step ? 'step' : undefined}
              className={`rounded-pill px-3 py-1 ${index === step ? 'bg-ink text-surface' : index < step ? 'bg-accent/10 text-accent' : 'bg-border text-muted'}`}
            >
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        {customer && step > 0 && (
          <Card padding="sm" className="text-sm text-body">
            <strong className="font-medium text-ink">{customer.fullName}</strong> · {formatCnic(customer.cnic)}
            {device && step > 1 && <> · {device.brand} {device.model} · IMEI {device.imeis[0]}</>}
          </Card>
        )}

        {step === 0 && <CustomerStep selected={customer} onSelect={setChosenCustomer} />}
        {step === 1 && (
          <DeviceStep
            branchId={branchId}
            onBranchChange={(id) => {
              setChosenBranch(id);
              setDevice(null);
            }}
            selected={device}
            onSelect={setDevice}
          />
        )}
        {step === 2 && customer && device && <TermsStep branchId={branchId} customer={customer} device={device} />}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < 2 && (
            <Button onClick={() => setStep(step + 1)} disabled={!canContinue}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </Page>
  );
}
