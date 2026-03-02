export interface ICacheConfig {
  keyPrefix: string;
  ttl: {
    searchResults: number;
    searchAll: number;
    rateLimit: number;
  };
  cleanupInterval: number;
}

export const cacheConfig: ICacheConfig = {
  keyPrefix: 'zero-dash-capture-api:',
  ttl: {
    searchResults: parseInt(process.env.CACHE_SEARCH_TTL || '900', 10),
    searchAll: parseInt(process.env.CACHE_SEARCH_ALL_TTL || '1800', 10),
    rateLimit: parseInt(process.env.CACHE_RATE_LIMIT_TTL || '60', 10),
  },
  cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '300000', 10),
};
