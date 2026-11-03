import { APP_NAME } from '@shop/shared';
import Logo from './logo';

export default function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-wordmark">
      <Logo />
      <span className={`text-lg font-semibold tracking-tight ${collapsed ? 'sr-only' : ''}`}>{APP_NAME}</span>
    </span>
  );
}
