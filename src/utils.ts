import { ContainsArrayError, HTTPStore, openArray, openGroup, ZarrArray } from 'zarr';
import type { Group as ZarrGroup } from 'zarr';

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

function normalizeStore(source: string | ZarrArray['store']) {
  if (typeof source === 'string') {
    const [root, path] = source.split('.zarr');
    return { store: new HTTPStore(root + '.zarr'), path };
  }
  return { store: source, path: '' };
}

export async function open(source: string | ZarrArray['store']) {
  const { store, path } = normalizeStore(source);
  return openGroup(store, path).catch((err) => {
    if (err instanceof ContainsArrayError) {
      return openArray({ store, path });
    }
    throw err;
  });
}

export async function loadMultiscales(grp: ZarrGroup, multiscales: Ome.Multiscale[]) {
  const { datasets } = multiscales[0] || [{ path: '0' }];
  const nodes = await Promise.all(datasets.map(({ path }) => grp.getItem(path)));
  if (nodes.every((node): node is ZarrArray => node instanceof ZarrArray)) {
    return nodes;
  }
  throw Error('Multiscales metadata included a path to a group.');
}

export function hexToRGB(hex: string): number[] {
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

export function getAxisLabels(arr: ZarrArray, axis_labels?: string[]): string[] {
  if (!axis_labels || axis_labels.length != arr.shape.length) {
    // default axis_labels are e.g. ['0', '1', 'y', 'x']
    const nonXYaxisLabels = arr.shape.slice(0, -2).map((_, i) => '' + i);
    axis_labels = nonXYaxisLabels.concat(['y', 'x']);
  }
  return axis_labels;
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
