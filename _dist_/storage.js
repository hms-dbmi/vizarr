import {KeyError, HTTPError} from "../_snowpack/pkg/zarr.js";
const encoder = new TextEncoder();
export class FileReferenceStore {
  constructor(ref) {
    this.ref = ref;
  }
  static async fromUrl(url) {
    const json = await fetch(url).then((res) => res.json());
    if ("version" in json) {
      throw Error("Only v0 ReferenceFileSystem description is currently supported!");
    }
    const ref = new Map(Object.entries(json));
    return new FileReferenceStore(ref);
  }
  _url(url) {
    const [protocol, _path] = url.split("://");
    if (protocol === "https" || protocol === "http") {
      return url;
    }
    throw Error("Protocol not supported, got: " + JSON.stringify(protocol));
  }
  _fetch({url, offset, size}, opts) {
    if (offset !== void 0 && size !== void 0) {
      opts = {...opts, headers: {...opts.headers, Range: `bytes=${offset}-${offset + size - 1}`}};
    }
    return fetch(this._url(url), opts);
  }
  async getItem(key, opts = {}) {
    const entry = this.ref.get(key);
    if (!entry) {
      throw new KeyError(key);
    }
    if (typeof entry === "string") {
      return encoder.encode(entry).buffer;
    }
    const [url, offset, size] = entry;
    const res = await this._fetch({url, offset, size}, opts);
    if (res.status === 200 || res.status === 206) {
      return res.arrayBuffer();
    }
    throw new HTTPError(`Request unsuccessful for key ${key}. Response status: ${res.status}.`);
  }
  async containsItem(key) {
    return this.ref.has(key);
  }
  keys() {
    return Promise.resolve([...this.ref.keys()]);
  }
  setItem(key, value) {
    throw Error("FileReferenceStore.setItem is not implemented.");
  }
  deleteItem(key) {
    throw Error("FileReferenceStore.deleteItem is not implemented.");
  }
}
