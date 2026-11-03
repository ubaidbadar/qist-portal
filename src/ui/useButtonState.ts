import type { ElementType } from 'react';
import { useFormStatus } from 'react-dom';

/** Native buttons also show as pending while their parent <form> action runs. */
export function useButtonState(as: ElementType | undefined, loading: boolean, disabled: boolean | undefined) {
  const { pending } = useFormStatus();
  const isNativeButton = as === undefined || as === 'button';
  const isPending = loading || (isNativeButton && pending);

  return { isPending, isDisabled: disabled || isPending };
}
