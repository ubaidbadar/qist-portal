import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, PASSWORD_MIN_LENGTH, signupSchema, type Session } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, PasswordInput } from '../../ui';
import { apiPost } from '../../config/api';
import { signIn } from '../../auth';
import AuthCard, { authLinkClasses } from './auth_card';
import GoogleAuthSection from './google_auth_section';

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="Get started with Qist"
      subtitle="Continue with Google and set up your shop in a few simple steps."
      footer={
        <>
          Already on {APP_NAME}?{' '}
          <Link to="/login" className={authLinkClasses}>Sign in</Link>
        </>
      }
    >
      <GoogleAuthSection redirectTo="/" />

      <details className="mt-6 rounded-card border border-border px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-body">Create an account with email instead</summary>
        <div className="mt-4 border-t border-border pt-4">
          <Form
            schema={signupSchema}
            defaultValues={{ orgName: '', branchName: '', fullName: '', email: '', password: '' }}
            onSubmit={async ({ data }) => {
              signIn(await apiPost<Session>('/auth/signup', signupSchema.parse(data), { skipAuthRefresh: true }));
              navigate('/', { replace: true });
            }}
            component={({ register, errors, loading, error }) => (
              <div className="space-y-4">
                <Input label="Shop name" placeholder="e.g. Al-Madina Mobiles" autoComplete="organization" {...register('orgName')} error={fieldError(errors, 'orgName')} />
                <Input label="First branch" placeholder="e.g. Main Branch" {...register('branchName')} error={fieldError(errors, 'branchName')} />
                <Input label="Your name" autoComplete="name" {...register('fullName')} error={fieldError(errors, 'fullName')} />
                <Input label="Email" type="email" autoComplete="email" {...register('email')} error={fieldError(errors, 'email')} />
                <PasswordInput
                  label="Password"
                  autoComplete="new-password"
                  placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                  {...register('password')}
                  error={fieldError(errors, 'password')}
                />
                {error && <Alert tone="danger">{error}</Alert>}
                <Button type="submit" loading={loading} className="w-full">Create account with email</Button>
              </div>
            )}
          />
        </div>
      </details>
    </AuthCard>
  );
}
