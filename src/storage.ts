import type { AsyncStore } from 'zarr/types/storage/types';
import { KeyError, HTTPError } from 'zarr';

type Ref = string | [url: string] | [url: string, offset: number, length: number];

const encoder = new TextEncoder();

export class FileReferenceStore implements AsyncStore<ArrayBuffer> {
  constructor(public ref: Map<string, Ref>) {}

  static async fromUrl(url: string) {
    const json: Record<string, Ref> = await fetch(url).then((res) => res.json());
    if ('version' in json) {
      throw Error('Only v0 ReferenceFileSystem description is currently supported!');
    }
    const ref = new Map(Object.entries(json));
    return new FileReferenceStore(ref);
  }

  _url(url: string) {
    const [protocol, _path] = url.split('://');
    if (protocol === 'https' || protocol === 'http') {
      return url;
    }
    throw Error('Protocol not supported, got: ' + JSON.stringify(protocol));
  }

  _fetch({ url, offset, size }: { url: string; offset?: number; size?: number }, opts: RequestInit) {
    if (offset !== undefined && size !== undefined) {
      // add range headers to request options
      opts = { ...opts, headers: { ...opts.headers, Range: `bytes=${offset}-${offset + size - 1}` } };
    }
    return fetch(this._url(url), opts);
  }

  async getItem(key: string, opts: RequestInit = {}) {
    const entry = this.ref.get(key);

    if (!entry) {
      throw new KeyError(key);
    }

    if (typeof entry === 'string') {
      // JSON data entry in reference
      return encoder.encode(entry).buffer;
    }

    const [url, offset, size] = entry;
    const res = await this._fetch({ url, offset, size }, opts);

    if (res.status === 200 || res.status === 206) {
      return res.arrayBuffer();
    }

    throw new HTTPError(`Request unsuccessful for key ${key}. Response status: ${res.status}.`);
  }

  async containsItem(key: string) {
    return this.ref.has(key);
  }

  keys() {
    return Promise.resolve([...this.ref.keys()]);
  }

  setItem(key: string, value: ArrayBuffer): never {
    throw Error('FileReferenceStore.setItem is not implemented.');
  }

  deleteItem(key: string): never {
    throw Error('FileReferenceStore.deleteItem is not implemented.');
  }
}
