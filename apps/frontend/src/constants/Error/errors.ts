export const RELOAD_ATTEMPT_KEY = 'error-boundary-reload-attempted';

export const LOADABLE_ERROR_INDICATORS = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'loadable-components: failed to asynchronously load component',
  'MIME type',
  'module script',
  'Expected a JavaScript-or-Wasm module script',
  'dynamically imported module',
];

export const RELOAD_DELAY_MS = 100;
export const RETRY_INTERVAL_MS = 5000;
export const COUNTDOWN_INITIAL = 5;
