import { useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2 } from 'lucide-react';
import { orgSettingsUpdateSchema, type Me, type Org, type OrgLogoInput } from '@shop/shared';
import { Alert, Button, Input, Skeleton, toast } from '../../ui';
import { saveBusinessSettings } from './save_business_settings';
import { ME_KEY } from '../../auth';
import QueryView from '../../shared/query_view';
import { prepareOrgLogo } from '../../utils/prepare_org_logo';
import { orgLogoUrl } from '../../utils/org_logo_url';
import { orgQuery } from './queries';
import SettingsCard from './settings_card';
import getAxiosMessage from '../../utils/get_axios_message';

export default function OrganizationTab() {
  const query = useQuery(orgQuery);
  return (
    <QueryView query={query} skeleton={<Skeleton className="h-96 w-full max-w-4xl" />}>
      {(org) => <OrganizationForm key={org._id} org={org} />}
    </QueryView>
  );
}
function OrganizationForm({ org }: { org: Org }) {
  const cache = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(org.name);
  const [logo, setLogo] = useState<OrgLogoInput | null | undefined>();
  const [preview, setPreview] = useState<string | null | undefined>();
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState('');
  const [baseline, setBaseline] = useState(org);
  const dirty = name !== baseline.name || logo !== undefined;
  const update = useMutation({
    mutationFn: () => {
      const parsed = orgSettingsUpdateSchema.safeParse({
        name,
        ...(logo !== undefined ? { logo } : {}),
        expectedUpdatedAt: baseline.updatedAt,
      });
      if (!parsed.success)
        throw new Error(parsed.error.issues[0]?.message ?? 'Check your business settings.');
      return saveBusinessSettings(parsed.data, baseline, result => {
        cache.setQueryData(orgQuery.queryKey, result);
        cache.setQueryData<Me>(ME_KEY, previous => previous ? { ...previous, org: result } : previous);
        setBaseline(result);
      });
    },
    onSuccess: (result) => {
      cache.setQueryData(orgQuery.queryKey, result);
      cache.setQueryData<Me>(ME_KEY, (previous) => (previous ? { ...previous, org: result } : previous));
      setBaseline(result);
      setName(result.name);
      setLogo(undefined);
      setPreview(undefined);
      toast.success('Business settings saved');
    },
    onError: (cause) => setError(getAxiosMessage(cause)),
  });
  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPreparing(true);
    setError('');
    try {
      const prepared = await prepareOrgLogo(file);
      setLogo({ contentType: prepared.contentType, data: prepared.data });
      setPreview(prepared.previewUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to prepare the image.');
    } finally {
      setPreparing(false);
    }
  };
  const shownLogo = preview === undefined ? orgLogoUrl(baseline) : preview;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (dirty && !preparing && !update.isPending) {
          setError('');
          update.mutate();
        }
      }}
    >
      <SettingsCard
        title="Business details"
        description="Your logo and name, as customers see them on receipts and agreements."
        footer={
          <Button type="submit" loading={update.isPending} disabled={!dirty || preparing}>
            Save changes
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-canvas">
            {shownLogo ? (
              <img src={shownLogo} alt="Shop logo preview" className="size-full object-contain" />
            ) : (
              <ImagePlus size={28} className="text-muted" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                icon={ImagePlus}
                disabled={preparing || update.isPending}
                onClick={() => input.current?.click()}
              >
                {preparing ? 'Preparing logo…' : 'Change logo'}
              </Button>
              {(shownLogo || logo) && (
                <Button
                  type="button"
                  variant="ghost"
                  icon={Trash2}
                  disabled={update.isPending}
                  onClick={() => {
                    setLogo(null);
                    setPreview(null);
                  }}
                >
                  Remove
                </Button>
              )}
              <input
                ref={input}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={choose}
                className="sr-only"
                aria-label="Choose shop logo"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted">
              PNG, JPG or WebP, up to 8 MB. Optimized before saving.
            </p>
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <Input
            label="Business name"
            required
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            disabled={update.isPending}
          />
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        {dirty && (
          <p role="status" className="text-xs text-muted">
            Changes are saved when you choose Save changes.
          </p>
        )}
      </SettingsCard>
    </form>
  );
}
