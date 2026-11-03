import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME, loginSchema, type Session } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, PasswordInput } from '../../ui';
import { apiPost } from '../../config/api';
import { signIn } from '../../auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';

  return (
    <>
      <h1>Sign In</h1>
      <p className='mt-2'>Welcome back to {APP_NAME}.</p>
      <Form
        className='my-6'
        schema={loginSchema}
        defaultValues={{ email: '', password: '' }}
        onSubmit={async ({ data }) => {
          signIn(await apiPost<Session>('/auth/login', loginSchema.parse(data), { skipAuthRefresh: true }));
          navigate(from, { replace: true });
        }}
        component={({ register, errors, loading, error }) => (
          <div className="space-y-4">
            <Input label="Email" type="email" autoComplete="email" autoFocus {...register('email')} error={fieldError(errors, 'email')} />
            <PasswordInput label="Password" autoComplete="current-password" {...register('password')} error={fieldError(errors, 'password')} />
            <div className="text-right text-sm">
              <Button variant="link" as={Link} to="/forgot-password">
                Forgot password?
              </Button>
            </div>
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </div>
        )}
      />
      New to {APP_NAME}?{' '}
      <Button variant="link" className="mr-auto" as={Link} to="/signup">
        Create an account
      </Button>
    </>
  );
}
