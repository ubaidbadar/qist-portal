import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';

const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTabId?: string;
  defaultTabId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTabId, defaultTabId, onChange, className = '' }: TabsProps) {
  const idPrefix = useId();
  const [selectedId, setSelectedId] = useControllableState(activeTabId, defaultTabId || tabs[0]?.id || '', onChange);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === selectedId));
  const activeTab = tabs[activeIndex];

  if (!activeTab) return null;

  const tabId = (id: string) => `${idPrefix}-tab-${id}`;
  const panelId = (id: string) => `${idPrefix}-tabpanel-${id}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEPS[e.key];
    if (!step) return;

    e.preventDefault();
    const nextTab = tabs[(activeIndex + step + tabs.length) % tabs.length];
    setSelectedId(nextTab.id);
    document.getElementById(tabId(nextTab.id))?.focus();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className="flex gap-1 border-b border-border overflow-x-auto hide-scrollbar"
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              type="button"
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(tab.id)}
              id={tabId(tab.id)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSelectedId(tab.id)}
              className={`min-h-12 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -outline-offset-2 rounded-t-small ${
                isActive
                  ? 'border-accent text-ink bg-accent/5 cursor-default'
                  : 'border-transparent text-muted hover:text-ink hover:border-border hover:bg-border/50 cursor-pointer'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="py-4 rounded-small"
        role="tabpanel"
        tabIndex={0}
        id={panelId(activeTab.id)}
        aria-labelledby={tabId(activeTab.id)}
      >
        {activeTab.content}
      </div>
    </div>
  );
}
