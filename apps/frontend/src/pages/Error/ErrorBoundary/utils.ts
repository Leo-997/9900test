import { LOADABLE_ERROR_INDICATORS } from '@/constants/Error/errors';

export function checkIsLoadableError(error: Error | null): boolean {
  if (!error) return false;

  const errorName = error.name || '';
  const errorMessage = error.message || '';
  const errorStack = error.stack || '';
  const errorString = `${errorName} ${errorMessage} ${errorStack}`.toLowerCase();

  return LOADABLE_ERROR_INDICATORS.some(
    (indicator) => errorString.includes(indicator.toLowerCase()),
  );
}
