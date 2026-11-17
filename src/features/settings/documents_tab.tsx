import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentPolicySchema, type DocumentPolicy } from '@shop/shared';
import { Alert, Button, Checkbox, Input, Skeleton, Textarea, toast } from '../../ui';
import { apiGet, apiPatch } from '../../config/api';
import QueryView from '../../shared/query_view';
import getAxiosMessage from '../../utils/get_axios_message';
import SettingsCard from './settings_card';
const key = ['document-settings'] as const;
type Settings = { policy: DocumentPolicy; available: boolean };
export default function DocumentsTab() {
  const query = useQuery({ queryKey: key, queryFn: () => apiGet<Settings>('/org/documents') });
  return (
    <QueryView query={query} skeleton={<Skeleton className="h-96 w-full max-w-4xl" />}>
      {(settings) => <DocumentPolicyForm settings={settings} />}
    </QueryView>
  );
}
function DocumentPolicyForm({ settings }: { settings: Settings }) {
  const cache = useQueryClient();
  const [policy, setPolicy] = useState(settings.policy);
  const [error, setError] = useState('');
  const update = useMutation({
    mutationFn: () => {
      const parsed = documentPolicySchema.safeParse(policy);
      if (!parsed.success) throw new Error('Check the file limits, retention period and notice.');
      return apiPatch<Settings>('/org/documents', parsed.data);
    },
    onSuccess: (data) => {
      cache.setQueryData(key, data);
      setPolicy(data.policy);
      toast.success('Document settings saved');
    },
    onError: (cause) => setError(getAxiosMessage(cause)),
  });
  const edit = <K extends keyof DocumentPolicy>(name: K, value: DocumentPolicy[K]) =>
    setPolicy((previous) => ({ ...previous, [name]: value }));
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!update.isPending) {
          setError('');
          update.mutate();
        }
      }}
    >
      <SettingsCard
        title="Documents"
        description="Private customer and contract documents, with staff review."
        footer={
          <Button type="submit" loading={update.isPending}>
            Save changes
          </Button>
        }
      >
        {!settings.available && (
          <Alert tone="warning">
            Private document storage and file checks are not ready. Uploads cannot be enabled yet.
          </Alert>
        )}
        <Checkbox
          label="Enable document uploads"
          checked={policy.enabled}
          onChange={(event) => edit('enabled', event.target.checked)}
          disabled={!settings.available || update.isPending}
        />
        <Checkbox
          label="Allow customers to submit documents for staff review"
          checked={policy.customerUploads}
          onChange={(event) => edit('customerUploads', event.target.checked)}
          disabled={update.isPending}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Maximum file size (MB)"
            type="number"
            min={1}
            max={10}
            value={policy.maxFileBytes / (1024 * 1024)}
            onChange={(event) => edit('maxFileBytes', Number(event.target.value) * 1024 * 1024)}
          />
          <Input
            label="Active files per record"
            type="number"
            min={1}
            max={20}
            value={policy.maxFiles}
            onChange={(event) => edit('maxFiles', Number(event.target.value))}
          />
        </div>
        <div className="border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-ink">Access and review</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Staff can submit documents. Owners and managers review submissions and view document contents in
            their authorized branches. Customers see their own permitted submissions; guarantor identity scans
            remain restricted.
          </p>
        </div>
        <Input
          label="Retention after the contract ends (days)"
          type="number"
          min={30}
          max={3650}
          value={policy.retentionDays}
          onChange={(event) => edit('retentionDays', Number(event.target.value))}
        />
        <Textarea
          label="Document retention notice shown to customers"
          value={policy.retentionNotice}
          maxLength={1000}
          rows={4}
          onChange={(event) => edit('retentionNotice', event.target.value)}
        />
        <p className="text-xs leading-relaxed text-muted">
          Use a retention period appropriate for your business requirements. A document marked Accepted
          records staff review; it does not certify the identity or create a guarantee.
        </p>
        {error && <Alert tone="danger">{error}</Alert>}
      </SettingsCard>
    </form>
  );
}
