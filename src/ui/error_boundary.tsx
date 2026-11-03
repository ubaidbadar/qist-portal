import { Component, type ErrorInfo, type ReactNode } from 'react';
import Button from './button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (typeof fallback === 'function') {
        return fallback({ error, reset: this.reset });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div
          role="alert"
          className="flex min-h-50 flex-col items-center justify-center rounded-card border border-danger-200 bg-danger-50/50 p-6 text-center"
        >
          <h2 className="mb-2 font-display text-lg font-semibold text-ink">Something went wrong</h2>
          <p className="mb-4 max-w-md text-sm text-muted">
            {error.message || 'An unexpected rendering error occurred.'}
          </p>
          <Button type="button" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }

    return children;
  }
}
