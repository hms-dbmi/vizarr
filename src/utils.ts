import { ContainsArrayError, HTTPStore, openArray, openGroup, ZarrArray } from 'zarr';
import type { Group as ZarrGroup } from 'zarr';
import type { AsyncStore, Store } from 'zarr/types/storage/types';
import type { ZarrPixelSource } from '@hms-dbmi/viv';
import { Matrix4 } from 'math.gl';
import { LRUCacheStore } from './lru-store';

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

async function normalizeStore(source: string | Store) {
  let path;
  if (typeof source === 'string') {
    let store: AsyncStore<ArrayBuffer>;

    if (source.endsWith('.json')) {
      // import custom store implementation
      const [{ ReferenceStore }, json] = await Promise.all([
        import('reference-spec-reader'),
        fetch(source).then((res) => res.json()),
      ]);

      store = ReferenceStore.fromJSON(json);
    } else {
      const url = new URL(source);
      store = new HTTPStore(url.origin);
      path = url.pathname.slice(1);
    }

    // Wrap remote stores in a cache
    return { store: new LRUCacheStore(store), path };
  }

  return { store: source, path };
}

export async function open(source: string | Store) {
  const { store, path } = await normalizeStore(source);
  return openGroup(store, path).catch((err) => {
    if (err instanceof ContainsArrayError) {
      return openArray({ store });
    }
    throw err;
  });
}

const decoder = new TextDecoder();
export function getAttrsOnly<T = unknown>(grp: ZarrGroup, path: string) {
  return (grp.store as AsyncStore<ArrayBuffer>)
    .getItem(join(grp.path, path, '.zattrs'))
    .then((b) => decoder.decode(b))
    .then((text) => JSON.parse(text) as T);
}

export async function loadMultiscales(grp: ZarrGroup, multiscales: Ome.Multiscale[]) {
  const { datasets } = multiscales[0] || [{ path: '0' }];
  const nodes = await Promise.all(datasets.map(({ path }) => grp.getItem(path)));
  if (nodes.every((node): node is ZarrArray => node instanceof ZarrArray)) {
    return nodes;
  }
  throw Error('Multiscales metadata included a path to a group.');
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

export function getAxisLabels(arr: ZarrArray, axis_labels?: string[]): [...string[], 'y', 'x'] {
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

export function guessTileSize(arr: ZarrArray) {
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
) {
  const scaleX = (targetWidth - padding * 2) / width;
  const scaleY = (targetHeight - padding * 2) / height;
  const zoom = Math.min(maxZoom, Math.log2(Math.min(scaleX, scaleY)));
  return { zoom, target: [width / 2, height / 2, 0] };
}

// prettier-ignore
type Array16 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

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
    if (!isArray16(arr)) {
      throw Error('Invalid modelMatrix size. Must be 16.');
    }
    matrix.setRowMajor(...arr);
  } catch {
    const msg = `Failed to parse modelMatrix. Got ${JSON.stringify(model_matrix)}, using identity.`;
    console.warn(msg);
  }
  return matrix;
}

export async function calcDataRange<S extends string[]>(
  source: ZarrPixelSource<S>,
  selection: number[]
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

  if (csize !== visibilities.length) {
    throw new Error("provided visibilities don't match number of channels");
  }

  return Promise.all(
    visibilities.map(async (isVisible, i) => {
      if (!isVisible) return undefined; // don't compute non-visible channels
      const selection = [...def];
      selection[channelAxis] = i;
      return calcDataRange(source, selection);
    })
  );
}
