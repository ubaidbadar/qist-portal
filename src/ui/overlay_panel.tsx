import type { HTMLAttributes, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { OverlayProps } from '../hoc/withOverlay';

// Where the panel sits, and the offset it enters from (@starting-style) and leaves to (the 'close' state).
const placements = {
  center: { container: 'items-center justify-center p-4 sm:p-6', enter: 'starting:scale-95', exit: 'scale-95' },
  right: { container: 'justify-end', enter: 'starting:translate-x-full', exit: 'translate-x-full' },
  bottom: { container: 'flex-col justify-end', enter: 'starting:translate-y-full', exit: 'translate-y-full' },
};

interface OverlayPanelProps extends Pick<OverlayProps, 'state' | 'close'>, HTMLAttributes<HTMLDivElement> {
  from: keyof typeof placements;
  children: ReactNode;
}

/**
 * Backdrop + dialog panel shared by Modal, Drawer and BottomSheet. Animated in CSS only: the enter
 * transition starts from @starting-style, the exit plays during useShow's 'close' window.
 */
export default function OverlayPanel({ state, close, from, className = '', children, ...panelProps }: OverlayPanelProps) {
  const { container, enter, exit } = placements[from];
  const isClosing = state === 'close';

  return createPortal(
    // The container is the backdrop: a click on it, not on the panel, closes.
    <div
      onClick={(e) => e.target === e.currentTarget && close()}
      className={`fixed inset-0 z-50 flex bg-scrim backdrop-blur-sm transition-opacity duration-200 ease-out starting:opacity-0 motion-reduce:transition-none ${container} ${isClosing ? 'pointer-events-none opacity-0' : ''}`}
    >
      <div
        role="dialog"
        className={`transition-[translate,scale] duration-300 ease-emphasized motion-reduce:transition-none ${enter} ${isClosing ? exit : ''} ${className}`}
        {...panelProps}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
