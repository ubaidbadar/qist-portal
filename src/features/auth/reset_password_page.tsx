import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Form, toast } from '../../ui';
import { apiPost } from '../../config/api';
import AuthCard, { authLinkClasses } from './auth_card';
import NewPasswordInputs from './new_password_inputs';
import { MISMATCH, newPasswordFields, passwordsMatch } from './new_password_schema';

const resetFormSchema = z.object(newPasswordFields).refine(passwordsMatch, MISMATCH);

/** Opened from the emailed link (`?token=`). */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = useSearchParams()[0].get('token') ?? '';
  const backToForgot = (
    <Link to="/forgot-password" className={authLinkClasses}>
      Send a new link
    </Link>
  );

  if (!token) {
    return (
      <AuthCard title="Reset your password" footer={backToForgot}>
        <Alert tone="danger">This link is incomplete. Open the link from your email again, or ask for a new one.</Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="You'll be signed out on every device and can sign in with it straight away." footer={backToForgot}>
      <Form
        schema={resetFormSchema}
        defaultValues={{ password: '', confirmPassword: '' }}
        onSubmit={async ({ data }) => {
          const { password } = resetFormSchema.parse(data);
          await apiPost('/auth/reset-password', { token, password }, { skipAuthRefresh: true });
          toast.success('Password updated. Sign in with your new password.');
          navigate('/login', { replace: true });
        }}
        component={({ register, errors, loading, error }) => (
          <div className="space-y-4">
            <NewPasswordInputs register={register} errors={errors} autoFocus />
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" loading={loading} className="w-full">
              Save new password
            </Button>
          </div>
        )}
      />
    </AuthCard>
  );
}
