import type { AsyncReadable } from '@zarrita/storage';
import QuickLRU from 'quick-lru';

export class LRUCacheStore<S extends AsyncReadable> {
  cache: QuickLRU<string, Promise<Uint8Array | undefined>>;
  constructor(public store: S, maxSize: number = 100) {
    this.cache = new QuickLRU({ maxSize });
  }
  get(...args: Parameters<S['get']>) {
    const [key, opts] = args;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const value = this.store.get(key, opts).catch((err) => {
      this.cache.delete(key);
      throw err;
    });
    this.cache.set(key, value);
    return value;
  }
}
