import type { HTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import IconButton from './icon_button';

interface DialogHeaderProps {
  title?: string;
  closeLabel: string;
  close: () => void;
}

export function DialogHeader({ title, closeLabel, close }: DialogHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-border bg-surface px-6 py-4">
      {title && (
        <h2 className="m-0 font-display text-xl text-ink">
          {title}
        </h2>
      )}
      <IconButton icon={X} onClick={close} aria-label={closeLabel} className="-me-2 ms-auto" />
    </div>
  );
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DialogFooter({ children, className = '', ...props }: DialogFooterProps) {
  return (
    <div
      className={`flex shrink-0 justify-end gap-3 border-t border-border bg-surface px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
