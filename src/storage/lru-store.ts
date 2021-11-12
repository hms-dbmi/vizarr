import type { AsyncStore } from 'zarr/types/storage/types';
import QuickLRU from 'quick-lru';

export class LRUCacheStore<S extends AsyncStore<ArrayBuffer>> {
  cache: QuickLRU<string, Promise<ArrayBuffer>>;

  constructor(public store: S, maxSize: number = 100) {
    this.cache = new QuickLRU({ maxSize });
  }

  getItem(...args: Parameters<S['getItem']>) {
    const [key, opts] = args;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const value = this.store.getItem(key, opts).catch((err) => {
      this.cache.delete(key);
      throw err;
    });
    this.cache.set(key, value);
    return value;
  }

  async containsItem(key: string) {
    return this.cache.has(key) || this.store.containsItem(key);
  }

  keys() {
    return this.store.keys();
  }

  deleteItem(key: string): never {
    throw new Error('deleteItem not implemented');
  }

  setItem(key: string, value: ArrayBuffer): never {
    throw new Error('setItem not implemented');
  }
}
