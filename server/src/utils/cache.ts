/**
 * Redis-ready cache abstraction with an in-memory default implementation.
 * Swap `MemoryCacheClient` for a Redis client in production without touching callers.
 */

export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string, ttlSeconds?: number): Promise<number>;
}

interface Entry {
  value: unknown;
  expiresAt: number;
}

export class MemoryCacheClient implements CacheClient {
  private store = new Map<string, Entry>();
  private counters = new Map<string, { count: number; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    // Opportunistic cleanup to bound memory.
    if (this.store.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.store) {
        if (now > v.expiresAt) this.store.delete(k);
      }
    }
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async incr(key: string, ttlSeconds = 3600): Promise<number> {
    const now = Date.now();
    const entry = this.counters.get(key);
    if (!entry || now > entry.expiresAt) {
      this.counters.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 });
      return 1;
    }
    entry.count += 1;
    return entry.count;
  }
}

export const cache: CacheClient = new MemoryCacheClient();
