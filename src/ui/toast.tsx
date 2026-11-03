import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { createStore, useStore } from '../utils/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

const TOAST_DURATION = 4000;
const toastStore = createStore<ToastMessage[]>([]);
const timers = new Map<string, number>();

function dismiss(id: string) {
  window.clearTimeout(timers.get(id));
  timers.delete(id);
  if (toastStore.get().some((t) => t.id === id)) {
    toastStore.set((toasts) => toasts.filter((t) => t.id !== id));
  }
}

function show(message: string, type: ToastType) {
  const id = crypto.randomUUID();
  toastStore.set((toasts) => [...toasts, { id, type, message }]);
  timers.set(id, window.setTimeout(() => dismiss(id), TOAST_DURATION));
}

export const toast = {
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error'),
  warning: (message: string) => show(message, 'warning'),
  info: (message: string) => show(message, 'info'),
  dismiss,
};

const toastStyles: Record<ToastType, { container: string; icon: ReactNode }> = {
  success: {
    container: 'border-s-4 border-s-accent bg-canvas',
    icon: <CheckCircle2 className="text-success-800 shrink-0" size={20} aria-hidden="true" />,
  },
  error: {
    container: 'border-l-4 border-l-danger-500 bg-danger-50',
    icon: <AlertCircle className="text-danger-500 shrink-0" size={20} aria-hidden="true" />,
  },
  warning: {
    container: 'border-l-4 border-l-warning-500 bg-warning-50',
    icon: <AlertTriangle className="text-warning-500 shrink-0" size={20} aria-hidden="true" />,
  },
  info: {
    container: 'border-l-4 border-l-info-500 bg-info-50',
    icon: <Info className="text-info-500 shrink-0" size={20} aria-hidden="true" />,
  },
};

function Toast({ id, type, message }: ToastMessage) {
  const style = toastStyles[type];

  return (
    <div
      className={`border border-border shadow-lg rounded-control p-4 flex items-center gap-3 min-w-75 pointer-events-auto transition duration-300 starting:opacity-0 starting:translate-x-8 motion-reduce:transition-none ${style.container}`}
    >
      {style.icon}
      <span className="text-sm font-medium text-ink flex-1">{message}</span>
      <button
        type="button"
        onClick={() => dismiss(id)}
        className="flex size-12 shrink-0 items-center justify-center rounded-pill text-muted hover:bg-border hover:text-ink transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Render once near the app root; `toast.*` can be called from anywhere. */
export function ToastContainer() {
  const toasts = useStore(toastStore);

  // Always mounted: screen readers only announce changes inside a live region that already exists.
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:end-4 z-100 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}
