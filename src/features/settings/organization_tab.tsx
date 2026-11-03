import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orgUpdateSchema } from '@shop/shared';
import { Alert, Button, Card, fieldError, Form, Input, Skeleton } from '../../ui';
import { apiPatch } from '../../config/api';
import { ME_KEY } from '../../auth';
import QueryView from '../../shared/query_view';
import { orgQuery } from './queries';

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
                <Button type="submit" loading={loading}>
                  Save
                </Button>
              </div>
            )}
          />
        </Card>
      )}
    </QueryView>
  );
}
