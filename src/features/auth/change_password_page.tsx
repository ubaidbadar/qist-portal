import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { changePasswordSchema, type Session } from '@shop/shared';
import { Alert, Button, fieldError, Form, PasswordInput, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { logOut, signIn, useMe } from '../../auth';
import AuthCard, { authLinkClasses } from './auth_card';
import NewPasswordInputs from './new_password_inputs';
import { MISMATCH, newPasswordFields, passwordsMatch } from './new_password_schema';

const changeFormSchema = z
  .object({ currentPassword: changePasswordSchema.shape.currentPassword, ...newPasswordFields })
  .refine(passwordsMatch, MISMATCH);

/** Required after signing in with a temporary password; also reachable from the user menu. */
export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user } = useMe();

  return (
    <AuthCard
      title={user.mustChangePassword ? 'Choose your own password' : 'Change password'}
      subtitle={
        user.mustChangePassword
          ? 'You signed in with a temporary password. Choose one only you know before continuing.'
          : 'You will stay signed in here and be signed out on other devices.'
      }
      footer={
        <button type="button" onClick={() => void logOut()} className={`${authLinkClasses} cursor-pointer`}>
          Sign out
        </button>
      }
    >
      <Form
        schema={changeFormSchema}
        defaultValues={{ currentPassword: '', password: '', confirmPassword: '' }}
        onSubmit={async ({ data }) => {
          const { currentPassword, password } = changeFormSchema.parse(data);
          signIn(await apiPost<Session>('/me/password', { currentPassword, newPassword: password }));
          toast.success('Password changed');
          navigate('/', { replace: true });
        }}
        component={({ register, errors, loading, error }) => (
          <div className="space-y-4">
            <PasswordInput
              label={user.mustChangePassword ? 'Temporary password' : 'Current password'}
              autoComplete="current-password"
              autoFocus
              {...register('currentPassword')}
              error={fieldError(errors, 'currentPassword')}
            />
            <NewPasswordInputs register={register} errors={errors} />
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" loading={loading} className="w-full">
              Save password
            </Button>
          </div>
        )}
      />
    </AuthCard>
  );
}
