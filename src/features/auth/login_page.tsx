import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, type Session } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, PasswordInput } from '../../ui';
import { apiPost } from '../../config/api';
import { signIn } from '../../auth';
import AuthCard, { authLinkClasses } from './auth_card';

export default function LoginPage() {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your customers and installments."
      footer={<>New to Qist? <Link className={authLinkClasses} to="/signup">Create an account</Link></>}
    >
      <Form
        schema={loginSchema}
        defaultValues={{ email: '', password: '' }}
        onSubmit={async ({ data }) => {
          signIn(await apiPost<Session>('/auth/login', loginSchema.parse(data), { skipAuthRefresh: true }));
          navigate(from, { replace: true });
        }}
        component={({ register, errors, loading, error }) => (
          <div className="space-y-5">
            <Input label="Email" type="email" autoComplete="email" autoFocus {...register('email')} error={fieldError(errors, 'email')} />
            <div>
              <PasswordInput label="Password" autoComplete="current-password" {...register('password')} error={fieldError(errors, 'password')} />
              <div className="mt-1 text-end">
                <Link className={authLinkClasses} to="/forgot-password">Forgot password?</Link>
              </div>
            </div>
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" loading={loading} className="w-full">Sign in</Button>
          </div>
        )}
      />
    </AuthCard>
  );
}
