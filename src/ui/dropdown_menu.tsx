import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import { useAnchoredPosition, type Placement } from '../hooks/useAnchoredPosition';
import IconButton from './icon_button';
import { useDismiss } from '../hooks/useDismiss';

const GAP = 8;
const OPEN_KEYS = ['Enter', ' ', 'ArrowDown'];

export interface DropdownMenuItem extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  label: string;
  onClick: () => void;
  icon?: ElementType;
  danger?: boolean;
}

export interface DropdownMenuProps {
  /** A callback can read the open state for aria-expanded on custom triggers. */
  trigger?: ReactNode | ((isOpen: boolean) => ReactNode);
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export default function DropdownMenu({ trigger, items, align = 'right', className = '' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const placeMenu: Placement = (anchor, menu) => {
    const spaceBelow = window.innerHeight - anchor.bottom;
    const opensUp = spaceBelow < menu.height && anchor.top > spaceBelow;
    const rightAligned = anchor.right - menu.width;
    // Flip to the other edge when the preferred alignment would overflow the viewport.
    const left =
      align === 'right'
        ? rightAligned < 0 ? anchor.left : rightAligned
        : anchor.left + menu.width > window.innerWidth ? rightAligned : anchor.left;

    return { top: opensUp ? anchor.top - menu.height - GAP : anchor.bottom + GAP, left };
  };

  const { anchorRef, floatingRef, floatingStyle } = useAnchoredPosition<HTMLDivElement>(isOpen, placeMenu);

  const open = (index = -1) => {
    setIsOpen(true);
    setActiveIndex(index);
  };

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const focusTrigger = () => anchorRef.current?.querySelector('button')?.focus();

  const focusItem = (index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  };

  const select = (item: DropdownMenuItem) => {
    item.onClick();
    close();
  };

  useDismiss(isOpen, [anchorRef, floatingRef], (reason) => {
    close();
    if (reason === 'escape') focusTrigger();
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (OPEN_KEYS.includes(e.key)) {
        e.preventDefault();
        open(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem((activeIndex + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem((activeIndex - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (items[activeIndex]) {
          select(items[activeIndex]);
          focusTrigger();
        }
        break;
      case 'Tab':
        close();
        break;
    }
  };

  return (
    <div className={`inline-block text-left ${className}`} ref={anchorRef} onKeyDown={handleKeyDown}>
      <div onClick={() => (isOpen ? close() : open())} className="cursor-pointer inline-block">
        {typeof trigger === 'function' ? trigger(isOpen) : trigger || (
          <IconButton icon={MoreVertical} aria-label="More options" aria-haspopup="menu" aria-expanded={isOpen} />
        )}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={floatingRef}
            style={floatingStyle}
            role="menu"
            aria-orientation="vertical"
            className="z-50 w-48 py-1 rounded-control bg-surface shadow-lg ring-1 ring-border animate-pop-in motion-reduce:animate-none"
          >
            {items.map((item, index) => (
              <MenuItem
                key={`${item.label}-${index}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                item={item}
                isActive={index === activeIndex}
                onSelect={() => select(item)}
                onHover={() => focusItem(index)}
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

interface MenuItemProps {
  ref: Ref<HTMLButtonElement>;
  item: DropdownMenuItem;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function MenuItem({ ref, item, isActive, onSelect, onHover }: MenuItemProps) {
  const { label, icon: Icon, danger, className = '', onClick, ...buttonProps } = item;
  // The active item is always the focused one (hover moves focus too), so focus alone drives the highlight.
  const toneClasses = danger ? 'text-danger-600 focus:bg-danger-50' : 'text-body focus:bg-border focus:text-ink';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      // Opening from the keyboard activates the first item; focus it as it mounts.
      autoFocus={isActive}
      className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left transition-colors outline-hidden cursor-pointer ${toneClasses} ${className}`}
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      {...buttonProps}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      {label}
    </button>
  );
}
