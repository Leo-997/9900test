export function normalizePort(
  port: number | string | undefined,
  defaultPort: number,
): number {
  if (port) {
    const val: number = typeof port === 'string' ? parseInt(port, 10) : port;
    if (!Number.isNaN(val) && val > 0) {
      return val;
    }
  }
  return defaultPort;
}
