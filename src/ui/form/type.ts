import type { BaseSyntheticEvent, FormHTMLAttributes, ReactNode } from 'react';
import type { zodResolver } from '@hookform/resolvers/zod';
import type {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

export interface SubmitProps {
  data: FieldValues;
  onSuccess: (message: string) => void;
  onError: (error: unknown) => void;
  onReset: () => void;
  setError: (name: string, error: string) => void;
  onProgress: (message: string) => void;
}

export interface FormStatus {
  loading?: boolean;
  message?: string;
  error?: string;
}

export interface FormComponentProps extends FormStatus {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  control: Control<FieldValues>;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  component: (props: FormComponentProps) => ReactNode;
  onSubmit?: (data: SubmitProps) => void | Promise<void>;
  defaultValues?: FieldValues;
  schema?: Parameters<typeof zodResolver>[0];
}
