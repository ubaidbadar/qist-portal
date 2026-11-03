import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useAnchoredPosition, type Placement } from '../hooks/useAnchoredPosition';

const GAP = 8;

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

function placeTooltip(position: TooltipPosition): Placement {
  return (anchor, tip) => {
    const centeredLeft = anchor.left + (anchor.width - tip.width) / 2;
    const centeredTop = anchor.top + (anchor.height - tip.height) / 2;

    switch (position) {
      case 'top':
        return { top: anchor.top - tip.height - GAP, left: centeredLeft };
      case 'bottom':
        return { top: anchor.bottom + GAP, left: centeredLeft };
      case 'left':
        return { top: centeredTop, left: anchor.left - tip.width - GAP };
      case 'right':
        return { top: centeredTop, left: anchor.right + GAP };
    }
  };
}

export default function Tooltip({ content, children, position = 'top', delay = 200, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<number | undefined>(undefined);
  const { anchorRef, floatingRef, floatingStyle } = useAnchoredPosition<HTMLDivElement>(
    isVisible,
    placeTooltip(position),
  );

  const show = () => {
    window.clearTimeout(showTimerRef.current);
    showTimerRef.current = window.setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    window.clearTimeout(showTimerRef.current);
    setIsVisible(false);
  };

  return (
    <div
      className={`inline-block ${className}`}
      ref={anchorRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {isVisible &&
        createPortal(
          <div
            ref={floatingRef}
            style={floatingStyle}
            className="z-100 px-2.5 py-1.5 text-xs font-medium text-canvas bg-ink rounded-small shadow-sm whitespace-nowrap pointer-events-none animate-pop-in motion-reduce:animate-none"
            role="tooltip"
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
}
