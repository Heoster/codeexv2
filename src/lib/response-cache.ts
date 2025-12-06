interface CacheEntry {
  response: any;
  timestamp: number;
  ttl: number;
}

export class ResponseCache {
  private static cache = new Map<string, CacheEntry>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static generateKey(input: any, model: string): string {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    return `${model}:${btoa(inputStr).slice(0, 50)}`;
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  static set(key: string, response: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl
    });

    // Clean up old entries periodically
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  static clear(): void {
    this.cache.clear();
  }
}