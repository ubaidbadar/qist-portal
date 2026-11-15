import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Store } from 'lucide-react';
import {
  PASSWORD_MIN_LENGTH,
  googleOnboardingSchema,
  googleOnboardingStepSchemas,
  type Session,
} from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, PasswordInput, Textarea } from '../../ui';
import { signIn } from '../../auth';
import { apiPost } from '../../config/api';
import Brand from '../../app/layout/brand';
import { clearPendingGoogleAuth, getPendingGoogleAuth } from './google_auth';
import { prepareOrgLogo, type PreparedOrgLogo } from '../../utils/prepare_org_logo';

type OnboardingStep = 0 | 1 | 2;

const STEPS = [
  { title: 'Your shop', description: 'Shop name and owner details' },
  { title: 'Contact details', description: 'Phone number and location' },
  { title: 'Password', description: 'Secure your Qist account' },
] as const;

const STEP_HEADINGS = [
  { title: 'Tell us about your shop', subtitle: 'Start with your shop name. You can update these details later.' },
  { title: 'Where can we reach you?', subtitle: 'Add a contact number and the address of your shop.' },
  { title: 'Secure your account', subtitle: 'Create a password so you can sign in with your email next time.' },
] as const;

function getStepErrors(step: OnboardingStep, values: Record<string, unknown>): Record<string, string> | null {
  const result = googleOnboardingStepSchemas[step].safeParse(values);
  if (result.success) return null;

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string') errors[field] = issue.message;
  }
  return errors;
}

/** A short, three-step setup that keeps all form values until the final account creation. */
export default function GoogleOnboardingPage() {
  const navigate = useNavigate();
  const pending = getPendingGoogleAuth();
  const logoInputId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<OnboardingStep>(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState<PreparedOrgLogo | null>(null);
  const [logoError, setLogoError] = useState('');
  const [logoPreparing, setLogoPreparing] = useState(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  if (!pending) return <Navigate to="/login" replace />;

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setLogoError('');
    setLogoPreparing(true);
    try {
      setLogo(await prepareOrgLogo(file));
    } catch (error) {
      setLogo(null);
      setLogoError(error instanceof Error ? error.message : 'The logo could not be prepared.');
    } finally {
      setLogoPreparing(false);
    }
  };

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="hidden max-w-56 truncate text-muted sm:block">{pending.profile.email}</span>
            <Link
              to="/login"
              onClick={clearPendingGoogleAuth}
              className="shrink-0 rounded-chip font-semibold text-accent hover:underline"
            >
              Switch account
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[15rem_minmax(0,42rem)] lg:gap-8">
        <aside className="rounded-panel bg-brand-navy p-5 text-on-brand sm:p-6 lg:sticky lg:top-8 lg:h-fit">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Set up Qist</p>
          <h2 className="mt-2 text-xl font-semibold text-on-brand">Your shop, ready in a few minutes.</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">
            Three quick steps. You can change these details any time.
          </p>

          <ol aria-label="Setup progress" className="mt-6 grid grid-cols-3 gap-2 lg:flex lg:flex-col lg:gap-0">
            {STEPS.map((item, index) => {
              const completed = index < step;
              const current = index === step;
              return (
                <li key={item.title} aria-current={current ? 'step' : undefined} className="relative min-w-0 lg:pb-6">
                  {index < STEPS.length - 1 && (
                    <span aria-hidden="true" className="absolute start-4 top-9 hidden h-[calc(100%-1rem)] w-px bg-brand-raised lg:block" />
                  )}
                  <div className="relative flex flex-col items-center gap-2 text-center lg:flex-row lg:items-start lg:gap-3 lg:text-start">
                    {completed ? (
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                        <Check size={16} aria-hidden="true" />
                      </span>
                    ) : (
                      <span className={'grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold ' + (
                        current ? 'border-primary bg-primary text-on-primary' : 'border-brand-raised bg-brand-raised text-brand-muted'
                      )}>
                        {index + 1}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className={'block text-xs font-semibold sm:text-sm ' + (current || completed ? 'text-on-brand' : 'text-brand-muted')}>
                        {item.title}
                      </span>
                      <span className="mt-0.5 hidden text-xs leading-relaxed text-brand-muted lg:block">
                        {item.description}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-panel border border-border bg-surface shadow-card">
          <Form
            schema={googleOnboardingSchema}
            defaultValues={{
              fullName: pending.profile.fullName,
              shopName: '',
              phone: '',
              address: '',
              password: '',
              confirmPassword: '',
            }}
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
            component={({ register, errors, loading, error, watch }) => {
              const clearStepError = (name: string) => {
                setStepErrors((current) => {
                  if (!(name in current)) return current;
                  const next = { ...current };
                  delete next[name];
                  return next;
                });
              };
              const bindField = (name: string) => {
                const field = register(name);
                return {
                  ...field,
                  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    void field.onChange(event);
                    clearStepError(name);
                  },
                };
              };
              const goNext = () => {
                const nextErrors = getStepErrors(step, watch());
                if (nextErrors) {
                  setStepErrors(nextErrors);
                  return;
                }
                setStepErrors({});
                setStep((current) => Math.min(current + 1, 2) as OnboardingStep);
              };

              return (
                <div
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      step < 2 &&
                      event.target instanceof HTMLInputElement &&
                      event.target.type !== 'file'
                    ) {
                      event.preventDefault();
                      goNext();
                    }
                  }}
                >
                  <div className="border-b border-border px-5 py-5 sm:px-7 sm:py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Step {step + 1} of 3</p>
                    <h1 ref={headingRef} tabIndex={-1} aria-live="polite" className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                      {STEP_HEADINGS[step].title}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{STEP_HEADINGS[step].subtitle}</p>
                  </div>

                  <div className="min-h-80 space-y-5 px-5 py-6 sm:px-7">
                    {step === 0 && (
                      <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="shrink-0">
                            <label
                              htmlFor={logoInputId}
                              className="group relative grid size-28 cursor-pointer place-items-center overflow-hidden rounded-panel border border-dashed border-control-border bg-canvas transition-colors hover:border-accent hover:bg-accent/5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent"
                            >
                              {logo ? (
                                <img src={logo.previewUrl} alt="Selected shop logo" className="size-full object-contain p-2" />
                              ) : (
                                <span className="flex flex-col items-center gap-2 text-muted">
                                  <Store size={28} strokeWidth={1.6} aria-hidden="true" />
                                  <span className="text-xs font-semibold">Add shop logo</span>
                                </span>
                              )}
                              <span className="absolute bottom-2 end-2 grid size-8 place-items-center rounded-full bg-primary text-on-primary shadow-card">
                                <ImagePlus size={15} aria-hidden="true" />
                              </span>
                            </label>
                            <input
                              id={logoInputId}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              aria-label="Upload shop logo"
                              aria-describedby={logoError ? 'shop-logo-help shop-logo-error' : 'shop-logo-help'}
                              className="sr-only"
                              disabled={logoPreparing || loading}
                              onChange={handleLogoChange}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">
                              Shop logo <span className="ms-1 font-normal text-muted">Optional</span>
                            </p>
                            <p id="shop-logo-help" className="mt-1 max-w-sm text-sm leading-relaxed text-muted">
                              Choose a square PNG, JPG or WebP image. We’ll resize and optimize it for you.
                            </p>
                            {logoPreparing && <p role="status" className="mt-2 text-xs font-medium text-accent">Preparing your logo…</p>}
                            {logo && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => { setLogo(null); setLogoError(''); }}
                              >
                                Remove logo
                              </Button>
                            )}
                          </div>
                        </div>
                        {logoError && <div id="shop-logo-error"><Alert tone="danger">{logoError}</Alert></div>}

                        <Input
                          label="Shop name"
                          placeholder="e.g. Al-Madina Mobiles"
                          autoComplete="organization"
                          required
                          {...bindField('shopName')}
                          error={stepErrors.shopName ?? fieldError(errors, 'shopName')}
                        />
                        <Input
                          label="Your full name"
                          autoComplete="name"
                          required
                          {...bindField('fullName')}
                          error={stepErrors.fullName ?? fieldError(errors, 'fullName')}
                        />
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <Input
                          label="Shop contact number"
                          type="tel"
                          inputMode="tel"
                          placeholder="03XX XXXXXXX"
                          autoComplete="tel"
                          required
                          {...bindField('phone')}
                          error={stepErrors.phone ?? fieldError(errors, 'phone')}
                        />
                        <Textarea
                          label="Shop address"
                          placeholder="Shop number, street, area and city"
                          rows={4}
                          required
                          {...bindField('address')}
                          error={stepErrors.address ?? fieldError(errors, 'address')}
                        />
                      </>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-sm font-semibold text-ink">Create your password</h2>
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            Use at least {PASSWORD_MIN_LENGTH} characters. You’ll use this with your email to sign in.
                          </p>
                        </div>
                        <PasswordInput
                          label="Password"
                          autoComplete="new-password"
                          required
                          {...bindField('password')}
                          error={stepErrors.password ?? fieldError(errors, 'password')}
                        />
                        <PasswordInput
                          label="Confirm password"
                          autoComplete="new-password"
                          required
                          {...bindField('confirmPassword')}
                          error={stepErrors.confirmPassword ?? fieldError(errors, 'confirmPassword')}
                        />
                      </div>
                    )}

                    {error && <Alert tone="danger">{error}</Alert>}
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <Button
                      type="button"
                      variant="ghost"
                      icon={ArrowLeft}
                      disabled={step === 0 || loading}
                      onClick={() => {
                        setStepErrors({});
                        setStep((current) => Math.max(current - 1, 0) as OnboardingStep);
                      }}
                    >
                      Back
                    </Button>
                    {step < 2 ? (
                      <Button
                        type="button"
                        icon={ArrowRight}
                        iconPosition="right"
                        disabled={loading || logoPreparing}
                        onClick={goNext}
                        className="w-full sm:w-auto"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button type="submit" loading={loading} className="w-full sm:w-auto">
                        Create my shop
                      </Button>
                    )}
                  </div>
                </div>
              );
            }}
          />
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-6 text-center text-sm text-muted sm:px-6">
        <Link to="/privacy-policy" className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">
          Customer app privacy policy
        </Link>
      </footer>
    </div>
  );
}
