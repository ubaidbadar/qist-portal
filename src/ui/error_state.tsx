import { AlertTriangle, RotateCw } from 'lucide-react';
import Button from './button';
import EmptyState from './empty_state';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = 'Could not load this',
  message = 'Something went wrong. Check your connection and try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        icon={AlertTriangle}
        tone="danger"
        title={title}
        description={message}
        className={className}
        action={onRetry && (
          <Button variant="outline" icon={RotateCw} onClick={onRetry}>
            Try again
          </Button>
        )}
      />
    </div>
  );
}
