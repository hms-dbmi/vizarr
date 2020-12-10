import { addCodec } from '@manzt/zarr-lite';

// @ts-ignore
addCodec('gzip', () => import('numcodecs/gzip').then(m => m.default));
// @ts-ignore
addCodec('zlib', () => import('numcodecs/zlib').then(m => m.default));
// @ts-ignore
addCodec('blosc', () => import('numcodecs/blosc').then(m => m.default));

export { openArray, HTTPStore } from '@manzt/zarr-lite';
export type { Store, ZarrArray } from '@manzt/zarr-lite';