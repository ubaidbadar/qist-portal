import { useId, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SearchX, UserRound, type LucideIcon } from 'lucide-react';
import { formatCnic, type Customer, type Page } from '@shop/shared';
import type { OverlayProps } from '../../hoc/withOverlay';
import { EmptyState, Input } from '../../ui';
import OverlayPanel from '../../ui/overlay_panel';
import { apiGet } from '../../config/api';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import useNavItems from '../useNavItems';

const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
const MIN_CUSTOMER_QUERY = 2;
const CUSTOMER_RESULTS = 5;

interface PaletteItem {
  key: string;
  label: string;
  detail?: string;
  icon: LucideIcon;
  to: string;
}

/** Jump to a page, or to a customer by name, CNIC or mobile. Opened with Ctrl/Cmd+K. */
export default function CommandPalettePanel({ state, close }: OverlayProps) {
  const navigate = useNavigate();
  const navItems = useNavItems();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const needle = query.trim().toLowerCase();
  const customerSearch = useDebouncedValue(query.trim());
  const customers = useQuery({
    queryKey: ['customers', 'palette', customerSearch],
    queryFn: () => apiGet<Page<Customer>>('/customers', { params: { q: customerSearch, limit: CUSTOMER_RESULTS } }),
    enabled: customerSearch.length >= MIN_CUSTOMER_QUERY,
  });

  const results: PaletteItem[] = [
    ...navItems
      .filter((item) => item.label.toLowerCase().includes(needle))
      .map((item) => ({ key: item.to, label: item.label, icon: item.icon, to: item.to })),
    ...(customers.data?.items ?? []).map((customer) => ({
      key: customer._id,
      label: customer.fullName,
      detail: formatCnic(customer.cnic),
      icon: UserRound,
      to: `/customers/${customer._id}`,
    })),
  ];
  const optionId = (index: number) => `${listId}-${index}`;

  const go = (item: PaletteItem) => {
    close();
    navigate(item.to);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const step = ARROW_STEPS[e.key];
    if (step && results.length > 0) {
      e.preventDefault();
      setActiveIndex((activeIndex + step + results.length) % results.length);
    } else if (e.key === 'Enter' && results[activeIndex]) {
      go(results[activeIndex]);
    }
  };

  return (
    <OverlayPanel
      state={state}
      close={close}
      from="center"
      aria-label="Search"
      className="mt-[12vh] flex w-full max-w-lg flex-col self-start overflow-hidden rounded-card bg-surface shadow-lg"
    >
      <div className="border-b border-border p-3">
        <Input
          icon={Search}
          autoFocus
          placeholder="Jump to a page or customer…"
          aria-label="Search pages and customers"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length > 0 ? optionId(activeIndex) : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {results.length === 0 ? (
        <EmptyState icon={SearchX} title="No matches" description={`Nothing found for “${query}”.`} className="py-8" />
      ) : (
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
          {results.map((item, index) => (
            <li
              key={item.key}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => go(item)}
              className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm text-body aria-selected:bg-accent/10 aria-selected:text-accent"
            >
              <item.icon size={18} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.detail && <span className="shrink-0 text-xs tabular-nums text-muted">{item.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </OverlayPanel>
  );
}
