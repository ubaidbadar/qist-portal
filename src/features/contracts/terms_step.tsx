import { useState } from 'react';
import { DOCUMENT_LABELS, type DocumentCategory } from '@shop/shared';
import { fetchDocuments, uploadDocument } from '../documents/queries';
import getAxiosMessage from '../../utils/get_axios_message';
import { CUSTOMERS_KEY } from '../customers/queries';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FREQUENCIES, type ContractWithSchedule, type Customer, type Device } from '@shop/shared';
import { Alert, Button, Checkbox, fieldError, Form, Input, Radio, Select, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { useMe } from '../../auth';
import { MARKUP_BASIS_OPTIONS } from './markup_basis';
import { FREQUENCY_LABELS } from '../../shared/labels';
import { DEVICES_KEY } from '../inventory/queries';
import { CONTRACTS_KEY, plansQuery } from './queries';
import { METHOD_OPTIONS } from '../payments/labels';
import TermsPreview from './terms_preview';
import { defaultTerms, termsFormSchema, toContractTerms } from './terms_form_schema';

interface TermsStepProps {
  branchId: string;
  customer: Customer;
  device: Device;
}

const FREQUENCY_OPTIONS = FREQUENCIES.map((frequency) => ({ value: frequency, label: FREQUENCY_LABELS[frequency] }));

/** Step 3: price and installments, with the schedule recalculated as you type. The server recalculates it again. */
export default function TermsStep({ branchId, customer, device }: TermsStepProps) {
  const navigate = useNavigate();
  const { branches } = useMe();
  const branchName = branches.find((item) => item._id === branchId)?.name ?? 'Unknown branch';
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<DocumentCategory>('agreement');
  const [consent, setConsent] = useState(false);
  const documents = useQuery({
    queryKey: ['contract-upload-options', customer._id],
    queryFn: () => fetchDocuments({ customerId: customer._id }),
  });
  const options = documents.data;
  const plans = (useQuery(plansQuery).data ?? []).filter((plan) => plan.active);
  const planOptions = [{ value: '', label: 'Custom terms' }, ...plans.map((plan) => ({ value: plan._id, label: plan.name }))];

  return (
    <Form
      schema={termsFormSchema}
      defaultValues={defaultTerms()}
      onSubmit={async ({ data }) => {
        if (files.length && (!options?.canUpload || !consent)) {
          throw new Error('Confirm permission to upload, or clear the selected files.');
        }
        if (files.length && options && (files.length > options.policy.maxFiles ||
          files.some(file => !file.size || file.size > options.policy.maxFileBytes ||
            !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)))) {
          throw new Error('Check the file format, size and number of attachments before creating the contract.');
        }
        const terms = toContractTerms(termsFormSchema.parse(data));
        const contract = await apiPost<ContractWithSchedule>('/contracts', { ...terms, branchId, customerId: customer._id, deviceId: device._id });
        await Promise.all([queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }), queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] }), queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] })]);
        let uploaded = 0;
        try {
          for (const file of files) {
            await uploadDocument({ contractId: contract._id }, file, category, '', crypto.randomUUID(),
              () => {}, new AbortController().signal);
            uploaded++;
          }
          toast.success(files.length ? 'Contract created. Files submitted for checking.' : 'Contract created');
        } catch (cause) {
          toast.warning(`Contract saved. ${uploaded} of ${files.length} uploads confirmed. Open Documents to check and retry. ${getAxiosMessage(cause)}`);
        }
        navigate(`/contracts/${contract._id}`, { replace: true });
      }}
      component={({ register, errors, control, setValue, loading, error }) => {
        const markupBasisError = fieldError(errors, 'markupBasis');
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Select
                label="Plan"
                options={planOptions}
                {...register('planId', {
                  onChange: (event) => {
                    const plan = plans.find((p) => p._id === event.target.value);
                    if (!plan) return;
                    setValue('count', plan.count);
                    setValue('frequency', plan.frequency);
                    setValue('markupPercent', plan.markupPercent);
                    setValue('markupBasis', plan.markupBasis ?? 'financed');
                  },
                })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Cash price (Rs)" type="number" min={0} {...register('cashRupees', { valueAsNumber: true })} error={fieldError(errors, 'cashRupees')} />
                <Input label="Down payment (Rs)" type="number" min={0} {...register('downRupees', { valueAsNumber: true })} error={fieldError(errors, 'downRupees')} />
                <Select label="Down payment paid by" options={METHOD_OPTIONS} {...register('downPaymentMethod')} />
                <fieldset className="space-y-2 sm:col-span-2">
                  <legend className="text-sm font-medium text-ink">Calculate markup on</legend>
                  <p className="text-xs text-muted" id="contract-markup-basis-help">
                    The down payment always reduces the installment principal. Choose whether markup is calculated on the remaining balance or the full cash price.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MARKUP_BASIS_OPTIONS.map((option) => (
                      <Radio
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        {...register('markupBasis')}
                        aria-describedby="contract-markup-basis-help"
                        className="rounded-control border border-border bg-surface px-3 py-3 transition-colors hover:border-accent/50 has-checked:border-accent has-checked:bg-canvas"
                      />
                    ))}
                  </div>
                  {markupBasisError && <p className="text-sm text-danger-600" role="alert">{markupBasisError}</p>}
                </fieldset>
                <Input label="Markup %" type="number" step="0.01" min={0} {...register('markupPercent', { valueAsNumber: true })} error={fieldError(errors, 'markupPercent')} />
                <Input label="Installments" type="number" min={1} {...register('count', { valueAsNumber: true })} error={fieldError(errors, 'count')} />
                <Select label="Paid" options={FREQUENCY_OPTIONS} {...register('frequency')} error={fieldError(errors, 'frequency')} />
                <Input label="First installment due" type="date" {...register('firstDueDate')} error={fieldError(errors, 'firstDueDate')} />
              </div>
              <fieldset className="space-y-3 rounded-card border border-border p-4" disabled={loading}>
                <legend className="px-1 text-sm font-medium">Contract documents (optional)</legend>
                <Input label="Photos or PDFs" type="file" multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  disabled={!options?.canUpload}
                  onChange={event => { setFiles(Array.from(event.target.files ?? [])); setConsent(false); }} />
                {options?.canUpload ? (
                  <p className="text-xs text-muted">Choose up to {options.policy.maxFiles} files, {Math.round(options.policy.maxFileBytes / 1024)} KB each.</p>
                ) : <p className="text-sm text-muted">{documents.isPending ? 'Checking upload availability…' :
                  documents.isError ? 'Upload availability could not be checked.' :
                  !options?.available ? 'Private file storage is not ready yet.' :
                  'Uploads are disabled for this shop or your role.'} You can still create the contract.</p>}
                {files.length > 0 && <>
                  <Select label="Document type for selected files" value={category}
                    options={(['agreement', 'invoice', 'warranty', 'phone_box', 'guarantee', 'customer_cnic_front', 'customer_cnic_back'] as const)
                      .map(value => ({ value, label: DOCUMENT_LABELS[value] }))}
                    onChange={event => setCategory(event.target.value as DocumentCategory)} />
                  <p className="text-xs text-muted">{options?.policy.retentionNotice}</p>
                  <Checkbox label="I have permission to submit these files to this shop." checked={consent}
                    onChange={event => setConsent(event.target.checked)} />
                </>}
              </fieldset>
              <div className="rounded-card border border-border bg-canvas px-5 py-4 text-sm">
                <h2 className="mb-2 text-base font-semibold text-ink">Review before creating</h2>
                <p className="text-body"><strong>Customer:</strong> {customer.fullName}</p>
                <p className="text-body"><strong>Phone:</strong> {device.brand} {device.model} · IMEI {device.imeis[0]}</p>
                <p className="text-body"><strong>Selling branch:</strong> {branchName}</p>
                <p className="mt-2 text-muted">Check the schedule and payment amounts before confirming.</p>
              </div>
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" loading={loading} className="w-full">
                Confirm and create contract
              </Button>
            </div>
            <TermsPreview control={control} />
          </div>
        );
      }}
    />
  );
}
