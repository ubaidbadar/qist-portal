import type { FieldErrors, UseFormRegister, FieldValues } from 'react-hook-form';
import { fieldError, PasswordInput } from '../../ui';
import { PASSWORD_MIN_LENGTH } from '@shop/shared';

interface NewPasswordInputsProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  autoFocus?: boolean;
}

/** "New password" and "Confirm", shared by the reset and change-password forms. */
export default function NewPasswordInputs({ register, errors, autoFocus }: NewPasswordInputsProps) {
  return (
    <>
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        autoFocus={autoFocus}
        placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
        {...register('password')}
        error={fieldError(errors, 'password')}
      />
      <PasswordInput
        label="Confirm new password"
        autoComplete="new-password"
        {...register('confirmPassword')}
        error={fieldError(errors, 'confirmPassword')}
      />
    </>
  );
}
