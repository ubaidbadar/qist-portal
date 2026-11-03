import { Link } from 'react-router-dom';
import { forgotPasswordSchema } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input } from '../../ui';
import { apiPost } from '../../config/api';
import AuthCard, { authLinkClasses } from './auth_card';

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
      footer={
        <Link to="/login" className={authLinkClasses}>
          Back to sign in
        </Link>
      }
    >
      <Form
        schema={forgotPasswordSchema}
        defaultValues={{ email: '' }}
        onSubmit={async ({ data, onSuccess }) => {
          const { email } = forgotPasswordSchema.parse(data);
          await apiPost('/auth/forgot-password', { email }, { skipAuthRefresh: true });
          onSuccess(`If ${email} has an account, a reset link is on its way. It works for 30 minutes.`);
        }}
        component={({ register, errors, loading, message, error }) =>
          message ? (
            <Alert tone="success">{message}</Alert>
          ) : (
            <div className="space-y-4">
              <Input label="Email" type="email" autoComplete="email" autoFocus {...register('email')} error={fieldError(errors, 'email')} />
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" loading={loading} className="w-full">
                Send reset link
              </Button>
            </div>
          )
        }
      />
    </AuthCard>
  );
}
