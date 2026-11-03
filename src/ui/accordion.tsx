import { useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemProps {
  id: string;
  title: string | ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

/**
 * Native <details>: the browser owns open state, keyboard, ARIA and find-in-page.
 * A shared `name` makes the items exclusive (opening one closes the others).
 */
export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
}: AccordionProps) {
  const groupName = useId();

  return (
    <div
      className={`w-full border border-border rounded-control bg-surface divide-y divide-border overflow-hidden ${className}`}
    >
      {items.map(({ id, title, content }) => (
        <details
          key={id}
          name={allowMultiple ? undefined : groupName}
          open={defaultOpenIds.includes(id)}
          className="disclosure group"
        >
          <summary className="flex items-center justify-between px-5 py-4 font-medium text-ink hover:bg-canvas/30 transition-colors cursor-pointer -outline-offset-2 [&::-webkit-details-marker]:hidden">
            {title}
            <ChevronDown
              className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
              size={20}
              aria-hidden="true"
            />
          </summary>
          <div className="px-5 pb-4 pt-1 text-body text-sm">{content}</div>
        </details>
      ))}
    </div>
  );
}
