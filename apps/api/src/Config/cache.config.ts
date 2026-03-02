export interface ICacheConfig {
  keyPrefix: string;
  ttl: {
    searchResults: number;
    searchAll: number;
    rateLimit: number;
  };
  cleanupInterval: number; // Cleanup interval in milliseconds
}

export const cacheConfig: ICacheConfig = {
  keyPrefix: 'zero-dash-api:',
  ttl: {
    searchResults: parseInt(process.env.CACHE_SEARCH_TTL || '900', 10), // 15 minutes
    searchAll: parseInt(process.env.CACHE_SEARCH_ALL_TTL || '1800', 10), // 30 minutes
    rateLimit: parseInt(process.env.CACHE_RATE_LIMIT_TTL || '60', 10), // 1 minute
  },
  cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '300000', 10), // 5 minutes
};
