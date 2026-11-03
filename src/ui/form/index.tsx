import { useState, type BaseSyntheticEvent } from 'react';
import { get, useForm, type FieldErrors, type FieldValues, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import getAxiosMessage, { getFieldErrors } from '../../utils/get_axios_message';
import type { FormProps, FormStatus } from './type';

export type { FormComponentProps, FormProps, FormStatus, SubmitProps } from './type';

/** The message for one field, ready for an input's `error` prop. `name` may be a path: "guarantors.0.cnic". */
export function fieldError(errors: FieldErrors, name: string): string | undefined {
  const err = get(errors, name) as { message?: unknown } | undefined;
  const message: unknown = err?.message;
  return typeof message === 'string' ? message : undefined;
}

/** react-hook-form + zod form whose `onSubmit` reports progress through callbacks. */
export default function Form({ component, onSubmit, defaultValues, schema, ...props }: FormProps) {
  const { register, handleSubmit, formState, reset, setError, setValue, watch, control } = useForm<FieldValues>({
    defaultValues,
    resolver: schema ? (zodResolver(schema) as Resolver<FieldValues>) : undefined,
  });
  const [status, setStatus] = useState<FormStatus>({});

  const submit = async (data: FieldValues, event?: BaseSyntheticEvent) => {
    event?.stopPropagation();
    if (status.loading || !onSubmit) return;

    setStatus({ loading: true });
    try {
      await onSubmit({
        data,
        onProgress: (message) => setStatus({ loading: true, message }),
        onSuccess: (message) => setStatus({ message }),
        onError: (error) => setStatus({ error: getAxiosMessage(error) }),
        onReset: () => {
          reset();
          setStatus({});
        },
        setError: (name, message) => {
          setStatus({});
          setError(name, { message });
        },
      });
    } catch (err) {
      // Problems the API ties to fields are shown under those inputs as well.
      for (const { path, message } of getFieldErrors(err)) setError(path, { message });
      setStatus({ error: getAxiosMessage(err) });
    }
  };

  const handleFormSubmit = (event?: BaseSyntheticEvent) => {
    // Record which named submit button was used, e.g. <button name="intent" value="draft">.
    const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter;
    if ((submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) && submitter.name) {
      setValue(submitter.name, submitter.value, { shouldDirty: true });
    }

    return handleSubmit(submit)(event);
  };

  return (
    <form {...props} onSubmit={handleFormSubmit}>
      {component({
        register,
        errors: formState.errors,
        ...status,
        setValue,
        watch,
        control,
        onSubmit: handleFormSubmit,
      })}
    </form>
  );
}
