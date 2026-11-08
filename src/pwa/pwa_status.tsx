import { Download, RefreshCw, WifiOff } from 'lucide-react';
import { useStore } from '../utils/store';
import { Button } from '../ui';
import { pwaStore, updatePortal } from './runtime';

/** This small leaf subscribes to native PWA events; the app's data screens do not. */
export default function PwaStatus() {
  const { offline, waiting } = useStore(pwaStore);
  if (!offline && !waiting) return null;
  return (
    <aside role="status" className="fixed inset-x-4 bottom-24 z-90 mx-auto max-w-sm rounded-card border border-border bg-surface p-4 text-sm text-ink shadow-lg lg:inset-x-auto lg:right-4 lg:bottom-4">
      {offline ? <p className="flex items-center gap-2"><WifiOff size={18} aria-hidden="true" />You're offline. Reconnect to save changes.</p> : (
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1"><p className="flex items-center gap-2"><Download size={18} aria-hidden="true" />Qist update ready</p><p className="mt-1 text-xs text-muted">Save your work before updating.</p></div>
          <Button size="sm" icon={RefreshCw} onClick={updatePortal}>Update</Button>
        </div>
      )}
    </aside>
  );
}
