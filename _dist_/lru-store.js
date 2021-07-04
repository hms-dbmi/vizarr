import QuickLRU from "../_snowpack/pkg/quick-lru.js";
export class LRUCacheStore {
  constructor(store, maxSize = 100) {
    this.store = store;
    this.maxSize = maxSize;
    this.cache = new QuickLRU({maxSize});
  }
  async getItem(...args) {
    const [key, opts] = args;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = await this.store.getItem(key, opts);
    this.cache.set(key, value);
    return value;
  }
  async containsItem(key) {
    return this.cache.has(key) || this.store.containsItem(key);
  }
  async keys() {
    return [];
  }
  deleteItem(key) {
    throw new Error("deleteItem not implemented");
  }
  setItem(key, value) {
    throw new Error("setItem not implemented");
  }
}
