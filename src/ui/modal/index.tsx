import type { ReactNode } from 'react';
import { renderFooter, type OverlayFooter, type OverlayProps } from '../../hoc/withOverlay';
import OverlayPanel from '../overlay_panel';
import { DialogFooter, DialogHeader } from '../dialog_parts';

export interface ModalProps extends OverlayProps {
  title?: string;
  /** Content, or a function of `close` for content that dismisses the modal itself. */
  children: ReactNode | ((close: () => void) => ReactNode);
  footer?: OverlayFooter;
  className?: string;
}

export default function Modal({ state, close, title, children, footer, className = '' }: ModalProps) {
  return (
    <OverlayPanel
      state={state}
      close={close}
      from="center"
      className={`flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-card bg-surface shadow-lg ${className}`}
    >
      <DialogHeader title={title} closeLabel="Close modal" close={close} />
      <div className="overflow-y-auto px-6 py-5">{typeof children === 'function' ? children(close) : children}</div>
      {footer && <DialogFooter>{renderFooter(footer, close)}</DialogFooter>}
    </OverlayPanel>
  );
}
