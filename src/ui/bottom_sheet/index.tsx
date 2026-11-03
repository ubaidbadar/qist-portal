import type { ReactNode } from 'react';
import type { OverlayProps } from '../../hoc/withOverlay';
import OverlayPanel from '../overlay_panel';

export interface BottomSheetProps extends OverlayProps {
  /** Content, or a function of `close` for content that dismisses the sheet. */
  children: ReactNode | ((close: () => void) => ReactNode);
}

export default function BottomSheet({ state, close, children }: BottomSheetProps) {
  return (
    <OverlayPanel
      state={state}
      close={close}
      from="bottom"
      aria-modal="true"
      // The grab handle is decoration only, so it is the panel's ::before rather than an element.
      className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-panel bg-surface shadow-sheet before:mx-auto before:mt-3 before:mb-1 before:h-1.5 before:w-12 before:shrink-0 before:rounded-full before:bg-border"
    >
      <div className="overflow-y-auto px-6 pt-4 pb-8">{typeof children === 'function' ? children(close) : children}</div>
    </OverlayPanel>
  );
}
