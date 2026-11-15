import { useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orgUpdateSchema, type Org, type OrgLogoInput } from '@shop/shared';
import { Alert, Button, Card, fieldError, Form, Input, Skeleton, toast } from '../../ui';
import { apiPatch } from '../../config/api';
import { ME_KEY } from '../../auth';
import QueryView from '../../shared/query_view';
import { prepareOrgLogo, type PreparedOrgLogo } from '../../utils/prepare_org_logo';
import { orgLogoUrl } from '../../utils/org_logo_url';
import { orgQuery } from './queries';

function ShopLogoEditor({ org }: { org: Org }) {
  const queryClient = useQueryClient();
  const [prepared, setPrepared] = useState<PreparedOrgLogo | null>(null);
  const [prepareError, setPrepareError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const updateLogo = useMutation({
    mutationFn: (logo: OrgLogoInput | null) => apiPatch<Org>('/org/logo', { logo }),
    onSuccess: async (_result, logo) => {
      setPrepared(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orgQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: ME_KEY }),
      ]);
      toast.success(logo ? 'Shop logo saved' : 'Shop logo removed');
    },
  });
  const currentLogoUrl = orgLogoUrl(org);

  const selectLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setPreparing(true);
    setPrepareError('');
    try {
      setPrepared(await prepareOrgLogo(file));
    } catch (cause) {
      setPrepared(null);
      setPrepareError(cause instanceof Error ? cause.message : 'Unable to prepare the image.');
    } finally {
      setPreparing(false);
    }
  };

  return (
    <section className="mt-6 space-y-3 border-t border-border pt-5" aria-label="Shop logo">
      <div>
        <h3 className="text-sm font-semibold text-ink">Shop logo</h3>
        <p className="mt-1 text-sm text-muted">Optional. Appears beside your shop name in Qist.</p>
      </div>
      {(prepared || currentLogoUrl) && (
        <img
          src={prepared?.previewUrl ?? currentLogoUrl ?? undefined}
          alt="Your shop logo"
          className="size-20 rounded-control border border-border bg-surface object-contain"
        />
      )}
      <Input type="file" label={currentLogoUrl ? 'Replace logo' : 'Add logo'} accept="image/png,image/jpeg,image/webp"
        onChange={selectLogo} disabled={preparing || updateLogo.isPending} />
      {preparing && <p role="status" className="text-sm text-muted">Optimizing logo…</p>}
      {prepareError && <Alert tone="danger">{prepareError}</Alert>}
      <div className="flex flex-wrap gap-2">
        {prepared && <Button type="button" loading={updateLogo.isPending} disabled={preparing}
          onClick={() => updateLogo.mutate({ contentType: prepared.contentType, data: prepared.data })}>Save logo</Button>}
        {currentLogoUrl && <Button type="button" variant="danger" loading={updateLogo.isPending} disabled={preparing}
          onClick={() => updateLogo.mutate(null)}>Remove logo</Button>}
      </div>
    </section>
  );
}

export default function OrganizationTab() {
  const query = useQuery(orgQuery);
  const queryClient = useQueryClient();

  return (
    <QueryView query={query} skeleton={<Skeleton className="h-48 w-full max-w-xl" />}>
      {(org) => (
        <Card className="max-w-xl">
          <h2 className="text-base font-semibold text-ink">Business details</h2>
          <p className="mt-0.5 text-sm text-muted">Shown to your team and printed on receipts and agreements.</p>
          <Form
            key={org.name}
            schema={orgUpdateSchema}
            defaultValues={{ name: org.name }}
            onSubmit={async ({ data, onSuccess }) => {
              await apiPatch('/org', orgUpdateSchema.parse(data));
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: orgQuery.queryKey }),
                queryClient.invalidateQueries({ queryKey: ME_KEY }),
              ]);
              onSuccess('Saved');
            }}
            component={({ register, errors, loading, message, error }) => (
              <div className="mt-5 space-y-4">
                <Input label="Business name" {...register('name')} error={fieldError(errors, 'name')} />
                {error && <Alert tone="danger">{error}</Alert>}
                {message && <Alert tone="success">{message}</Alert>}
                <Button type="submit" loading={loading}>Save</Button>
              </div>
            )}
          />
          <ShopLogoEditor org={org} />
        </Card>
      )}
    </QueryView>
  );
}
