import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, PASSWORD_MIN_LENGTH, signupSchema, type Session } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, PasswordInput } from '../../ui';
import { apiPost } from '../../config/api';
import { signIn } from '../../auth';
import AuthCard, { authLinkClasses } from './auth_card';

/** Creates the retailer's organization, its first branch and the owner account. */
export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="Create your account"
      subtitle="Set up your business. You can add more branches and your team later."
      footer={
        <>
          Already on {APP_NAME}?{' '}
          <Link to="/login" className={authLinkClasses}>
            Sign in
          </Link>
        </>
      }
    >
      <Form
        schema={signupSchema}
        defaultValues={{ orgName: '', branchName: '', fullName: '', email: '', password: '' }}
        onSubmit={async ({ data }) => {
          signIn(await apiPost<Session>('/auth/signup', signupSchema.parse(data), { skipAuthRefresh: true }));
          navigate('/', { replace: true });
        }}
        component={({ register, errors, loading, error }) => (
          <div className="space-y-4">
            <Input label="Business name" placeholder="e.g. Al-Madina Mobiles" autoFocus {...register('orgName')} error={fieldError(errors, 'orgName')} />
            <Input label="First branch" placeholder="e.g. Hall Road, Lahore" {...register('branchName')} error={fieldError(errors, 'branchName')} />
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
            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
          </div>
        )}
      />
    </AuthCard>
  );
}
