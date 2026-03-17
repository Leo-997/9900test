import { useEffect, type JSX, type ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorBoundaryPage } from './ErrorBoundaryPage';
import { checkIsLoadableError } from './utils';
import {
  RELOAD_ATTEMPT_KEY,
  RELOAD_DELAY_MS,
  RETRY_INTERVAL_MS,
} from '@/constants/Error/errors';

interface IErrorBoundaryProps {
  children: ReactNode;
}

export function ErrorBoundary({ children }: IErrorBoundaryProps): JSX.Element {
  // Global error handlers for async errors (loadable components)
  useEffect(() => {
    let reloadInterval: NodeJS.Timeout | null = null;

    const scheduleReload = (): void => {
      const hasAttemptedReload = sessionStorage.getItem(RELOAD_ATTEMPT_KEY) === 'true';

      if (!hasAttemptedReload) {
        // First attempt: reload immediately
        sessionStorage.setItem(RELOAD_ATTEMPT_KEY, 'true');
        setTimeout(() => {
          window.location.reload();
        }, RELOAD_DELAY_MS);
      } else {
        // Subsequent attempts: reload every 5 seconds
        if (reloadInterval) {
          clearInterval(reloadInterval);
        }
        reloadInterval = setInterval(() => {
          window.location.reload();
        }, RETRY_INTERVAL_MS);
      }
    };

    const globalErrorHandler = (event: ErrorEvent): void => {
      const err = event.error || new Error(event.message || 'Unknown error');
      if (checkIsLoadableError(err)) {
        event.preventDefault();
        scheduleReload();
      }
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
      const err = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason || 'Unhandled promise rejection'));

      if (checkIsLoadableError(err)) {
        event.preventDefault();
        scheduleReload();
      }
    };

    window.addEventListener('error', globalErrorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    return () => {
      if (reloadInterval) {
        clearInterval(reloadInterval);
      }
      window.removeEventListener('error', globalErrorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorBoundaryPage}
      onError={(error): void => {
        console.error('ErrorBoundary caught an error:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
