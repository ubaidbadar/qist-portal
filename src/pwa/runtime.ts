import { createStore } from '../utils/store';
import { toast } from '../ui/toast';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
interface PwaState {
  install: InstallPrompt | null;
  waiting: ServiceWorker | null;
  offline: boolean;
  installed: boolean;
}
const standalone = () => window.matchMedia('(display-mode: standalone)').matches ||
  Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
export const pwaStore = createStore<PwaState>({ install: null, waiting: null, offline: !navigator.onLine, installed: standalone() });
let started = false;
let updating = false;

/** Boot once outside React; StrictMode never registers duplicate listeners or workers. */
export function startPwa() {
  if (started || !import.meta.env.PROD) return;
  started = true;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    pwaStore.set((state) => ({ ...state, install: event as InstallPrompt }));
  });
  window.addEventListener('appinstalled', () => pwaStore.set((state) => ({ ...state, install: null, installed: true })));
  const connection = () => pwaStore.set((state) => ({ ...state, offline: !navigator.onLine }));
  window.addEventListener('online', connection);
  window.addEventListener('offline', connection);
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updating) window.location.reload();
  });
  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      const showWaiting = () => {
        if (registration.waiting && navigator.serviceWorker.controller) pwaStore.set((state) => ({ ...state, waiting: registration.waiting }));
      };
      showWaiting();
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', showWaiting);
      });
      // No timer/polling: browser update checks plus a foreground repair after returning to the app.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) void registration.update().catch(() => {});
      });
    } catch {
      // Installation support must never block the portal or authentication.
    }
  };
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', () => void register(), { once: true });
}
export function canInstallOnIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
export async function installPortal() {
  const prompt = pwaStore.get().install;
  if (!prompt) {
    toast.info('In Safari, open Share, then choose Add to Home Screen.');
    return;
  }
  pwaStore.set((state) => ({ ...state, install: null }));
  try {
    await prompt.prompt();
    await prompt.userChoice;
  } catch {
    toast.info('Use your browser menu to install Qist.');
  }
}
export function updatePortal() {
  const waiting = pwaStore.get().waiting;
  if (!waiting) return;
  updating = true;
  waiting.postMessage({ type: 'SKIP_WAITING' });
}
