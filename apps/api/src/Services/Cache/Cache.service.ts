import { Injectable, Logger } from '@nestjs/common';
import { cacheConfig } from 'Config/cache.config';

export interface ICacheOptions {
  ttl?: number; // Time to live in seconds
}

interface ICacheEntry {
  value: any;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  private readonly cache = new Map<string, ICacheEntry>();

  private readonly keyPrefix: string;

  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.keyPrefix = cacheConfig.keyPrefix;

    // Clean up expired entries based on config
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, cacheConfig.cleanupInterval);

    this.logger.log('In-memory cache service initialized');
  }

  /**
   * Set a key-value pair in cache
   */
  async set(key: string, value: any, options: ICacheOptions = {}): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const ttl = options.ttl || 300; // Default 5 minutes
      const expiresAt = Date.now() + (ttl * 1000);

      this.cache.set(fullKey, {
        value: JSON.parse(JSON.stringify(value)), // Deep clone
        expiresAt,
      });

      this.logger.debug(`Cached key: ${fullKey} with TTL: ${ttl}s`);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) {
        return null;
      }

      // Check if entry has expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(fullKey);
        return null;
      }

      this.logger.debug(`Retrieved from cache: ${fullKey}`);
      return entry.value as T;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      this.cache.delete(fullKey);
      this.logger.debug(`Deleted cache key: ${fullKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) {
        return false;
      }

      // Check if entry has expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(fullKey);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to check cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set cache with hash-based key for results
   */
  async setResults(prefix: string, obj: object, value: any): Promise<void> {
    const hash = this.generateHash(JSON.stringify(obj));
    const key = `${prefix}:${hash}`;
    await this.set(key, value, { ttl: cacheConfig.ttl.searchResults });
  }

  /**
   * Get results from cache
   */
  async getResults<T>(prefix: string, obj: object): Promise<T | null> {
    const hash = this.generateHash(JSON.stringify(obj));
    const key = `${prefix}:${hash}`;
    return this.get<T>(key);
  }

  /**
   * Set rate limit data
   */
  async setRateLimit(ip: string, data: { count: number; resetTime: number }): Promise<void> {
    const key = `rate_limit:${ip}`;
    const ttl = Math.ceil((data.resetTime - Date.now()) / 1000);
    await this.set(key, data, { ttl: Math.max(ttl, cacheConfig.ttl.rateLimit) });
  }

  /**
   * Get rate limit data
   */
  async getRateLimit(ip: string): Promise<{ count: number; resetTime: number } | null> {
    const key = `rate_limit:${ip}`;
    return this.get<{ count: number; resetTime: number }>(key);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Generate a simple hash for cache keys
   */
  private generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const char = str.charCodeAt(i);
      // eslint-disable-next-line no-bitwise
      hash = ((hash << 5) - hash) + char;
      // eslint-disable-next-line no-bitwise
      hash &= hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get full cache key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount += 1;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Graceful shutdown
   */
  async onModuleDestroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.logger.log('Cache cleanup interval cleared');
    }
    this.cache.clear();
    this.logger.log('In-memory cache cleared');
  }
}
