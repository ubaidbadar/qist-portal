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
      prompt: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

type CredentialHandler = (credential: string) => void | Promise<void>;

let googleScriptPromise: Promise<void> | null = null;
let initializedClientId: string | null = null;
let activeCredentialHandler: CredentialHandler | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error('Google sign-in could not load. Check your connection and try again.'));
    };
    document.head.append(script);
  });

  return googleScriptPromise;
}

function dispatchGoogleCredential(response: GoogleCredentialResponse) {
  if (response.credential && activeCredentialHandler) {
    void activeCredentialHandler(response.credential);
  }
}

/** Opens Google's One Tap prompt for the secondary text CTA; the official button remains the fallback. */
export function promptGoogleSignIn(): boolean {
  const googleId = window.google?.accounts.id;
  if (!googleId || !initializedClientId || !activeCredentialHandler) return false;
  googleId.prompt();
  return true;
}

interface GoogleSignInButtonProps {
  onCredential: CredentialHandler;
  busy?: boolean;
}

/** Google's official Sign in with Google button; initialize once and share the callback across auth screens. */
export default function GoogleSignInButton({ onCredential, busy = false }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState('');
  const configQuery = useQuery(googleAuthConfigQuery);
  const config = configQuery.data;
  const clientId = config?.clientId;
  const enabled = config?.enabled;

  useEffect(() => {
    if (!enabled || !clientId || !containerRef.current) return;

    let disposed = false;
    let observer: ResizeObserver | undefined;
    activeCredentialHandler = onCredential;

    void loadGoogleIdentityScript()
      .then(() => {
        if (disposed || !containerRef.current || !window.google) return;

        if (initializedClientId !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: dispatchGoogleCredential,
          });
          initializedClientId = clientId;
        }

        const render = () => {
          const container = containerRef.current;
          if (disposed || !container || !window.google) return;
          const width = Math.max(200, Math.min(400, Math.floor(container.clientWidth)));
          container.replaceChildren();
          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width,
          });
        };

        render();
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
          observer = new ResizeObserver(render);
          observer.observe(containerRef.current);
        }
      })
      .catch((error: unknown) => {
        if (!disposed) setLoadError(error instanceof Error ? error.message : 'Google sign-in could not load.');
      });

    return () => {
      disposed = true;
      observer?.disconnect();
      if (activeCredentialHandler === onCredential) activeCredentialHandler = null;
    };
  }, [clientId, enabled, onCredential]);

  if (configQuery.isPending) return <Skeleton className="h-11 w-full rounded-control" />;
  if (configQuery.isError) {
    return <Alert tone="warning">Google sign-in is temporarily unavailable. You can still use email and password.</Alert>;
  }
  if (!enabled || !clientId) {
    return <Alert tone="info">Google sign-in is not configured yet. You can still use email and password.</Alert>;
  }
  if (loadError) return <Alert tone="warning">{loadError}</Alert>;

  return (
    <div
      id="google-sign-in"
      aria-busy={busy}
      className={busy ? 'w-full pointer-events-none opacity-60' : 'w-full'}
    >
      <div ref={containerRef} className="flex min-h-11 w-full items-center justify-center" />
    </div>
  );
}
