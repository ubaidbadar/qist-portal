import { useState, type ChangeEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { googleOnboardingSchema, type Session } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Textarea } from '../../ui';
import { signIn } from '../../auth';
import { apiPost } from '../../config/api';
import { clearPendingGoogleAuth, getPendingGoogleAuth } from './google_auth';
import AuthCard, { authLinkClasses } from './auth_card';
import { prepareOrgLogo, type PreparedOrgLogo } from './prepare_logo';

export default function GoogleOnboardingPage() {
  const navigate = useNavigate();
  const pending = getPendingGoogleAuth();
  const [logo, setLogo] = useState<PreparedOrgLogo | null>(null);
  const [logoError, setLogoError] = useState('');

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setLogoError('');
    try {
      setLogo(await prepareOrgLogo(file));
    } catch (error) {
      setLogo(null);
      setLogoError(error instanceof Error ? error.message : 'The logo could not be prepared.');
    }
  };

  if (!pending) return <Navigate to="/login" replace />;

  return (
    <AuthCard
      title="Set up your shop"
      subtitle="Just a few details. You can change them later in settings."
      footer={
        <Link to="/login" onClick={clearPendingGoogleAuth} className={authLinkClasses}>
          Use a different Google account
        </Link>
      }
    >
      <div className="mb-6 flex min-w-0 items-center gap-3 rounded-control border border-border bg-surface p-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {pending.profile.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{pending.profile.fullName}</p>
          <p className="truncate text-sm text-muted">{pending.profile.email}</p>
        </div>
      </div>

      <Form
        schema={googleOnboardingSchema}
        defaultValues={{ shopName: '', phone: '', address: '' }}
        onSubmit={async ({ data }) => {
          const onboarding = googleOnboardingSchema.parse(data);
          const session = await apiPost<Session>(
            '/auth/google',
            {
              credential: pending.credential,
              onboarding: {
                ...onboarding,
                ...(logo ? { logo: { contentType: logo.contentType, data: logo.data } } : {}),
              },
            },
            { skipAuthRefresh: true },
          );
          clearPendingGoogleAuth();
          signIn(session);
          navigate('/', { replace: true });
        }}
        component={({ register, errors, loading, error }) => (
          <div className="space-y-4">
            <Input
              label="Shop name"
              placeholder="e.g. Al-Madina Mobiles"
              autoComplete="organization"
              autoFocus
              required
              {...register('shopName')}
              error={fieldError(errors, 'shopName')}
            />
            <Input
              label="Shop phone number"
              type="tel"
              placeholder="03XX XXXXXXX"
              autoComplete="tel"
              required
              {...register('phone')}
              error={fieldError(errors, 'phone')}
            />
            <Textarea
              label="Shop address"
              placeholder="Shop number, street, area and city"
              rows={3}
              required
              {...register('address')}
              error={fieldError(errors, 'address')}
            />

            <div className="space-y-2">
              <Input
                label="Shop logo (optional)"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
              />
              {logo && (
                <div className="flex items-center gap-3 rounded-control border border-border p-3">
                  <img src={logo.previewUrl} alt="Shop logo preview" className="size-14 rounded-control border border-border object-contain" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Logo ready</p>
                    <p className="text-xs text-muted">Optimized for fast loading</p>
                  </div>
                  <button type="button" onClick={() => setLogo(null)} className="ms-auto rounded-control px-2 py-2 text-sm font-medium text-muted hover:bg-border/60 hover:text-ink">
                    Remove
                  </button>
                </div>
              )}
              {logoError && <Alert tone="danger">{logoError}</Alert>}
              <p className="text-xs leading-relaxed text-muted">PNG, JPG or WebP. We'll resize it and keep it under 64 KB.</p>
            </div>

            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" loading={loading} className="w-full">
              Create my shop
            </Button>
          </div>
        )}
      />
    </AuthCard>
  );
}
