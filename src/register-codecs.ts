import { addCodec } from 'zarr';
import type { CodecConstructor } from 'numcodecs';

type CodecModule = { default: CodecConstructor<Record<string, unknown>> };

const cache: Map<string, Promise<CodecModule['default']>> = new Map();

function add(name: string, load: () => Promise<CodecModule>): void {
  // Cache import to avoid duplicate loads
  const loadAndCache = () => {
    if (!cache.has(name)) {
      const promise = load()
        .then((m) => m.default)
        .catch((err) => {
          cache.delete(name);
          throw err;
        });
      cache.set(name, promise);
    }
    return cache.get(name)!;
  };
  addCodec(name, loadAndCache);
}

// Add dynmaically imported codecs to Zarr.js registry.
add('lz4', () => import('numcodecs/lz4'));
add('gzip', () => import('numcodecs/gzip'));
add('zlib', () => import('numcodecs/zlib'));
add('zstd', () => import('numcodecs/zstd'));
add('blosc', () => import('numcodecs/blosc'));
