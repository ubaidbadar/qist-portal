import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Skeleton } from '../../ui';
import { googleAuthConfigQuery } from './google_auth';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleButtonOptions {
  type: 'standard';
  theme: 'outline';
  size: 'large';
  text: 'continue_with';
  shape: 'rectangular';
  width: number;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
      renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

type CredentialHandler = (credential: string) => void | Promise<void>;

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
let googleScriptPromise: Promise<void> | null = null;
let initializedClientId: string | null = null;

/**
 * Google Identity Services has one global callback. Keep each mounted button registered and route
 * credentials to the foreground dialog while it is open, otherwise to the page's main button.
 */
const handlers = new Map<symbol, { priority: number; onCredential: CredentialHandler }>();

function dispatchGoogleCredential(response: GoogleCredentialResponse) {
  if (!response.credential) return;
  const active = [...handlers.values()].sort((a, b) => b.priority - a.priority)[0];
  if (active) void active.onCredential(response.credential);
}

/** Load Google's official, automatically updated SDK in parallel with the API config query. */
function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_URL}"]`);
    const script = existing ?? document.createElement('script');

    const loaded = () => {
      cleanup();
      if (window.google?.accounts.id) resolve();
      else fail();
    };
    const fail = () => {
      cleanup();
      script.remove();
      googleScriptPromise = null;
      reject(new Error('Google sign-in could not load. Check your connection and try again.'));
    };
    const cleanup = () => {
      script.removeEventListener('load', loaded);
      script.removeEventListener('error', fail);
    };

    script.addEventListener('load', loaded);
    script.addEventListener('error', fail);
    if (!existing) {
      script.src = GOOGLE_SCRIPT_URL;
      script.async = true;
      document.head.append(script);
    }
  });

  return googleScriptPromise;
}

interface GoogleSignInButtonProps {
  onCredential: CredentialHandler;
  busy?: boolean;
  /** The dialog takes precedence over the underlying login button while both are mounted. */
  priority?: number;
}

/** The interactive Google account chooser must be Google's official button, never a simulated iframe click. */
export default function GoogleSignInButton({ onCredential, busy = false, priority = 0 }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const configQuery = useQuery(googleAuthConfigQuery);
  const clientId = configQuery.data?.clientId;
  const enabled = configQuery.data?.enabled;

  // SDK and config load concurrently; neither blocks the other.
  useEffect(() => {
    let active = true;
    void loadGoogleIdentityScript()
      .then(() => { if (active) setSdkReady(true); })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Google sign-in could not load.');
      });
    return () => { active = false; };
  }, []);

  // Credential callbacks change with the view state, but must not tear down Google's iframe.
  useEffect(() => {
    const key = Symbol('google-button');
    handlers.set(key, { priority, onCredential });
    return () => { handlers.delete(key); };
  }, [onCredential, priority]);

  useEffect(() => {
    if (!sdkReady || !enabled || !clientId || !containerRef.current || !window.google) return;

    const googleId = window.google.accounts.id;
    if (initializedClientId !== clientId) {
      googleId.initialize({ client_id: clientId, callback: dispatchGoogleCredential });
      initializedClientId = clientId;
    }

    const container = containerRef.current;
    let lastWidth = 0;
    const render = () => {
      const width = Math.max(200, Math.min(400, Math.floor(container.clientWidth)));
      if (lastWidth === width) return;
      lastWidth = width;
      container.replaceChildren();
      googleId.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width,
      });
    };

    render();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(render) : null;
    observer?.observe(container);
    return () => { observer?.disconnect(); };
  }, [sdkReady, enabled, clientId]);

  if (configQuery.isPending || (!sdkReady && !loadError)) {
    return <Skeleton className="h-11 w-full rounded-control" />;
  }
  if (configQuery.isError) {
    return <Alert tone="warning">Google sign-in is temporarily unavailable. You can still use email and password.</Alert>;
  }
  if (!enabled || !clientId) {
    return <Alert tone="info">Google sign-in is not configured yet. You can still use email and password.</Alert>;
  }
  if (loadError) return <Alert tone="warning">{loadError}</Alert>;

  return (
    <div aria-busy={busy} className={busy ? 'w-full pointer-events-none opacity-60' : 'w-full'}>
      <div ref={containerRef} className="flex min-h-11 w-full items-center justify-center" />
    </div>
  );
}
