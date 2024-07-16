import * as zarr from 'zarrita';
import type { Readable } from '@zarrita/storage';
import { Matrix4 } from 'math.gl';

import type { ZarrPixelSource } from './ZarrPixelSource';
import { lru } from './lru-store';
import type { ViewState } from './state';

export const MAX_CHANNELS = 6;

export const COLORS = {
  cyan: '#00FFFF',
  yellow: '#FFFF00',
  magenta: '#FF00FF',
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  white: '#FFFFFF',
};
export const MAGENTA_GREEN = [COLORS.magenta, COLORS.green];
export const RGB = [COLORS.red, COLORS.green, COLORS.blue];
export const CYMRGB = Object.values(COLORS).slice(0, -2);

async function normalizeStore(source: string | Readable): Promise<zarr.Location<Readable>> {
  if (typeof source === 'string') {
    let store: Readable;
    let path: `/${string}` = '/';
    if (source.endsWith('.json')) {
      // import custom store implementation
      const [{ default: ReferenceStore }, json] = await Promise.all([
        // @ts-expect-error
        import('@zarrita/storage/ref'),
        fetch(source).then((res) => res.json()),
      ]);
      store = ReferenceStore.fromSpec(json);
    } else {
      const url = new URL(source);
      // @ts-expect-error - pathname always starts with '/'
      path = url.pathname;
      url.pathname = '/';
      store = new zarr.FetchStore(url.href);
    }

    // Wrap remote stores in a cache
    return new zarr.Location(lru(store), path);
  }

  return zarr.root(source);
}

export async function open(source: string | Readable) {
  const location = await normalizeStore(source);
  return zarr.open(location);
}

export async function getAttrsOnly<T = unknown>(
  location: zarr.Location<Readable>,
  options: { path?: string; zarrVersion: 2 | 3 }
) {
  const decoder = new TextDecoder();
  if (options.path) {
    location = location.resolve(options.path);
  }
  if (options.zarrVersion === 3) {
    const attrs = await zarr.open.v3(location).then((node) => node.attrs);
    return resolveAttrs(attrs) as T;
  }
  const v2AttrsLocation = location.resolve('.zattrs');
  const maybeBytes = await location.store.get(v2AttrsLocation.path);
  const attrs = maybeBytes ? JSON.parse(decoder.decode(maybeBytes)) : {};
  return resolveAttrs(attrs) as T;
}

/**
 * Loads the multiscales from a group and returns the datasets.
 *
 * NOTE: We avoid loading the attributes here because we don't need them.
 */
export async function loadMultiscales(
  grp: zarr.Group<Readable>,
  multiscales: Ome.Multiscale[]
): Promise<Array<zarr.Array<zarr.DataType, Readable>>> {
  const { datasets } = multiscales[0] || [{ path: '0' }];
  return Promise.all(
    // TODO(Trevor): TS is not happy about { attrs: false }.
    // This is just missing from zarrita types, but it is ok and
    // avoids making unecessary requests for v2 (see: https://github.com/manzt/zarrita.js/blob/7edffbeefb0eb877df48f54c7e8def4219c69c59/packages/zarrita/CHANGELOG.md?plain=1#L214)
    datasets.map(({ path }) => zarr.open(grp.resolve(path), { kind: 'array', attrs: false } as { kind: 'array' }))
  );
}

export function hexToRGB(hex: string): [r: number, g: number, b: number] {
  if (hex.startsWith('#')) hex = hex.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}

export function range(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

// similar to Python's rstrip
export function rstrip(str: string, remove: string = ' '): string {
  // if the last character is in 'remove', truncate
  while (str.length > 0 && remove.includes(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1);
  }
  return str;
}

export function join(...args: (string | undefined)[]) {
  return args
    .filter(Boolean)
    .map((s: any) => rstrip(s as string, '/'))
    .join('/');
}

export function getAxisLabels(
  arr: zarr.Array<zarr.DataType, Readable>,
  axis_labels?: string[]
): [...string[], 'y', 'x'] {
  if (!axis_labels || axis_labels.length != arr.shape.length) {
    // default axis_labels are e.g. ['0', '1', 'y', 'x']
    const nonXYaxisLabels = arr.shape.slice(0, -2).map((_, i) => '' + i);
    axis_labels = nonXYaxisLabels.concat(['y', 'x']);
  }
  return axis_labels as [...string[], 'y', 'x'];
}

export function getNgffAxes(multiscales: Ome.Multiscale[]): Ome.Axis[] {
  // Returns axes in the latest v0.4+ format.
  // defaults for v0.1 & v0.2
  const default_axes = [
    { type: 'time', name: 't' },
    { type: 'channel', name: 'c' },
    { type: 'space', name: 'z' },
    { type: 'space', name: 'y' },
    { type: 'space', name: 'x' },
  ];
  function getDefaultType(name: string): string {
    if (name === 't') return 'time';
    if (name === 'c') return 'channel';
    return 'space';
  }
  let axes = default_axes;
  // v0.3 & v0.4+
  if (multiscales[0].axes) {
    axes = multiscales[0].axes.map((axis) => {
      // axis may be string 'x' (v0.3) or object
      if (typeof axis === 'string') {
        return { name: axis, type: getDefaultType(axis) };
      }
      const { name, type } = axis;
      return { name, type: type ?? getDefaultType(name) };
    });
  }
  return axes;
}

export function getNgffAxisLabels(axes: Ome.Axis[]): [...string[], 'y', 'x'] {
  const axes_names = axes.map((axis) => axis.name);
  return axes_names as [...string[], 'y', 'x'];
}

export function getDefaultVisibilities(n: number, visibilities?: boolean[]): boolean[] {
  if (!visibilities) {
    if (n <= MAX_CHANNELS) {
      // Default to all on if visibilities not specified and less than 6 channels.
      visibilities = Array(n).fill(true);
    } else {
      // If more than MAX_CHANNELS, only make first set on by default.
      visibilities = [...Array(MAX_CHANNELS).fill(true), ...Array(n - MAX_CHANNELS).fill(false)];
    }
  }
  return visibilities;
}

export function getDefaultColors(n: number, visibilities: boolean[]): string[] {
  let colors = [];
  if (n == 1) {
    colors = [COLORS.white];
  } else if (n == 2) {
    colors = MAGENTA_GREEN;
  } else if (n === 3) {
    colors = RGB;
  } else if (n <= MAX_CHANNELS) {
    colors = CYMRGB.slice(0, n);
  } else {
    // Default color for non-visible is white
    colors = Array(n).fill(COLORS.white);
    // Get visible indices
    const visibleIndices = visibilities.flatMap((bool, i) => (bool ? i : []));
    // Set visible indices to CYMRGB colors. visibleIndices.length === MAX_CHANNELS from above.
    for (const [i, visibleIndex] of visibleIndices.entries()) {
      colors[visibleIndex] = CYMRGB[i];
    }
  }
  return colors;
}

export function isInterleaved(shape: number[]) {
  const lastDimSize = shape[shape.length - 1];
  return lastDimSize === 3 || lastDimSize === 4;
}

export function guessTileSize(arr: zarr.Array<zarr.DataType, Readable>) {
  const interleaved = isInterleaved(arr.shape);
  const [ySize, xSize] = arr.chunks.slice(interleaved ? -3 : -2);
  const size = Math.min(ySize, xSize);
  // Needs to be a power of 2 for deck.gl
  return 2 ** Math.floor(Math.log2(size));
}

// Scales the real image size to the target viewport.
export function fitBounds(
  [width, height]: [width: number, height: number],
  [targetWidth, targetHeight]: [targetWidth: number, targetHeight: number],
  maxZoom: number,
  padding: number
): ViewState {
  const scaleX = (targetWidth - padding * 2) / width;
  const scaleY = (targetHeight - padding * 2) / height;
  const zoom = Math.min(maxZoom, Math.log2(Math.min(scaleX, scaleY)));
  return { zoom, target: [width / 2, height / 2] };
}

// prettier-ignore
type Array16 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

function isArray16(o: unknown): o is Array16 {
  if (!Array.isArray(o)) return false;
  return o.length === 16 && o.every((i) => typeof i === 'number');
}

export function parseMatrix(model_matrix?: string | number[]): Matrix4 {
  if (!model_matrix) {
    return Matrix4.IDENTITY;
  }
  const matrix = new Matrix4();
  try {
    const arr = typeof model_matrix === 'string' ? JSON.parse(model_matrix) : model_matrix;
    assert(isArray16(arr), 'Invalid modelMatrix size. Must be 16.');
    matrix.setRowMajor(...arr);
  } catch {
    const msg = `Failed to parse modelMatrix. Got ${JSON.stringify(model_matrix)}, using identity.`;
    console.warn(msg);
  }
  return matrix;
}

export async function calcDataRange(
  source: ZarrPixelSource,
  selection: Array<number>
): Promise<[min: number, max: number]> {
  if (source.dtype === 'Uint8') return [0, 255];
  const { data } = await source.getRaster({ selection });
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < data.length; i++) {
    if (data[i] > maxVal) maxVal = data[i];
    if (data[i] < minVal) minVal = data[i];
  }
  if (minVal === maxVal) {
    minVal = 0;
    maxVal = 1;
  }
  return [minVal, maxVal];
}

export async function calcConstrastLimits<S extends string[]>(
  source: ZarrPixelSource<S>,
  channelAxis: number,
  visibilities: boolean[],
  defaultSelection?: number[]
): Promise<([min: number, max: number] | undefined)[]> {
  const def = defaultSelection ?? source.shape.map(() => 0);
  const csize = source.shape[channelAxis];

  // channelAxis can be -1 if there is no 'c' dimension
  if (channelAxis !== -1) {
    assert(csize === visibilities.length, 'visibilities do not match number of channels');
  }

  return Promise.all(
    visibilities.map(async (isVisible, i) => {
      if (!isVisible) return undefined; // don't compute non-visible channels
      const selection = [...def];
      if (channelAxis > -1) {
        selection[channelAxis] = i;
      }
      return calcDataRange(source, selection);
    })
  );
}

/**
 * Create a promise that can be resolved or rejected externally.
 *
 * TODO: Switch to Promise.withResolvers when it's available
 */
export function defer<T>() {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // @ts-expect-error - resolve and reject are OK
  return { promise, resolve, reject };
}

/**
 * A simple event emitter that allows for typed events.
 *
 * @example
 * ```ts
 * const emitter = typedEmitter<{ foo: string, bar: number }>();
 * emitter.on('foo', (data) => console.log(data));
 * emitter.emit('foo', 'hello');
 * ```
 *
 * TODO: Add support for removing listeners.
 */
export function typedEmitter<T>() {
  let target = new EventTarget();
  return {
    on: <E extends keyof T & string>(event: E, cb: (data: T[E]) => void) => {
      target.addEventListener(event, (e) => cb((e as CustomEvent).detail));
    },
    emit: <E extends keyof T & string>(event: E, data: T[E]) => {
      target.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
  };
}

/**
 * Extracts the OME metadata from the zarr attributes
 *
 * TODO: We should use zod to handle this
 */
export function resolveAttrs(attrs: zarr.Attributes): zarr.Attributes {
  if ('ome' in attrs) {
    // @ts-expect-error - handles v0.5
    return attrs.ome;
  }
  return attrs;
}

/**
 * Error thrown when an assertion fails.
 */
export class AssertionError extends Error {
  /** @param message The error message. */
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * Make an assertion. An error is thrown if `expr` does not have truthy value.
 *
 * @param expr The expression to test.
 * @param msg The message to display if the assertion fails.
 */
export function assert(expr: unknown, msg = ''): asserts expr {
  if (!expr) {
    throw new AssertionError(msg);
  }
}

/**
 * Guess the zarr version of a store.
 */
export async function guessZarrVersion(location: zarr.Location<Readable>): Promise<2 | 3> {
  try {
    await zarr.open.v3(location);
    return 3;
  } catch (err) {
    if (!(err instanceof zarr.NodeNotFoundError)) {
      // rethrow if not a NodeNotFoundError
      throw err;
    }
    return 2;
  }
}

export function isOmePlate(attrs: zarr.Attributes): attrs is { plate: Ome.Plate } {
  return 'plate' in attrs;
}

export function isOmeWell(attrs: zarr.Attributes): attrs is { well: Ome.Well } {
  return 'well' in attrs;
}

export function isOmeroMultiscales(
  attrs: zarr.Attributes
): attrs is { omero: Ome.Omero; multiscales: Ome.Multiscale[] } {
  return 'omero' in attrs && 'multiscales' in attrs;
}

export function isMultiscales(attrs: zarr.Attributes): attrs is { multiscales: Ome.Multiscale[] } {
  return 'multiscales' in attrs;
}
