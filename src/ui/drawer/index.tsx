import type { ReactNode } from 'react';
import { renderFooter, type OverlayFooter, type OverlayProps } from '../../hoc/withOverlay';
import OverlayPanel from '../overlay_panel';
import { DialogFooter, DialogHeader } from '../dialog_parts';

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export type DrawerWidth = keyof typeof widthClasses;

export interface DrawerProps extends OverlayProps {
  title?: string;
  /** Content, or a function of `close` for content that dismisses the drawer (e.g. a form on success). */
  children: ReactNode | ((close: () => void) => ReactNode);
  footer?: OverlayFooter;
  width?: DrawerWidth;
}

export default function Drawer({ state, close, title, children, footer, width = 'md' }: DrawerProps) {
  return (
    <OverlayPanel
      state={state}
      close={close}
      from="right"
      aria-modal="true"
      className={`flex h-dvh w-full ${widthClasses[width]} flex-col bg-surface shadow-lg`}
    >
      <DialogHeader title={title} closeLabel="Close drawer" close={close} />
      <div className="p-6 overflow-y-auto flex-1 flex flex-col bg-canvas/30">
        {typeof children === 'function' ? children(close) : children}
      </div>
      {footer && <DialogFooter>{renderFooter(footer, close)}</DialogFooter>}
    </OverlayPanel>
  );
}
