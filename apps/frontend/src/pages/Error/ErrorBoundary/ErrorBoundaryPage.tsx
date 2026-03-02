import { Box } from '@mui/material';
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  type JSX,
} from 'react';
import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { checkIsLoadableError } from './utils';
import {
  RELOAD_ATTEMPT_KEY,
  RELOAD_DELAY_MS,
  COUNTDOWN_INITIAL,
} from '@/constants/Error/errors';

interface IErrorBoundaryPageProps {
  error: Error | unknown;
}

function getErrorTitle(isLoadableError: boolean): string {
  return isLoadableError ? 'A new version is available.' : 'Something went wrong.';
}

function getErrorMessage(
  isLoadableError: boolean,
  hasAttemptedReload: boolean,
  countdown: number,
  errorMessage?: string,
): string {
  if (isLoadableError) {
    return hasAttemptedReload
      ? `The page will automatically reload in ${countdown} second(s).`
      : 'The page will reload now.';
  }
  return errorMessage || 'An unexpected error occurred';
}

function getErrorButtonLabel(
  isLoadableError: boolean,
  hasAttemptedReload: boolean,
  countdown: number,
): string {
  if (isLoadableError) {
    return hasAttemptedReload ? `Reload Now (${countdown}s)` : 'Reload Now';
  }
  return 'Reload Page';
}

export function ErrorBoundaryPage({ error }: IErrorBoundaryPageProps): JSX.Element {
  const [countdown, setCountdown] = useState(COUNTDOWN_INITIAL);
  const errorObj = useMemo(() => {
    if (error instanceof Error) return error;
    const errorMessage = typeof error === 'string' ? error : error?.toString() || 'Unknown error';
    return new Error(errorMessage);
  }, [error]);
  const isLoadableError = checkIsLoadableError(errorObj);
  const reloadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAttemptedReload = sessionStorage.getItem(RELOAD_ATTEMPT_KEY) === 'true';

  const reloadPage = useCallback((): void => {
    if (reloadIntervalRef.current) {
      clearInterval(reloadIntervalRef.current);
      reloadIntervalRef.current = null;
    }
    sessionStorage.setItem(RELOAD_ATTEMPT_KEY, 'true');
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!isLoadableError || !errorObj) return undefined;

    // First attempt: reload immediately
    if (!hasAttemptedReload) {
      const timeout = setTimeout(() => {
        reloadPage();
      }, RELOAD_DELAY_MS);
      return () => clearTimeout(timeout);
    }

    // Subsequent attempts: reload every 5 seconds
    setCountdown(COUNTDOWN_INITIAL);
    reloadIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          reloadPage();
          return COUNTDOWN_INITIAL; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (reloadIntervalRef.current) {
        clearInterval(reloadIntervalRef.current);
        reloadIntervalRef.current = null;
      }
    };
  }, [isLoadableError, errorObj, hasAttemptedReload, reloadPage]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      gap="24px"
      padding="32px"
    >
      <CustomTypography variant="h4" sx={{ textAlign: 'center' }}>
        {getErrorTitle(isLoadableError)}
      </CustomTypography>
      <CustomTypography variant="bodyRegular" sx={{ textAlign: 'center', maxWidth: '600px' }}>
        {getErrorMessage(isLoadableError, hasAttemptedReload, countdown, errorObj?.message)}
      </CustomTypography>
      <Box display="flex" gap="16px" flexWrap="wrap" justifyContent="center">
        <CustomButton
          label={getErrorButtonLabel(isLoadableError, hasAttemptedReload, countdown)}
          variant="bold"
          onClick={reloadPage}
        />
      </Box>
    </Box>
  );
}
