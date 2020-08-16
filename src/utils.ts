import { HTTPStore } from 'zarr';
import type { OmeroImageData } from './types/rootAttrs';

export const COLORS = {
  cyan: [0, 255, 255],
  yellow: [255, 255, 0],
  magenta: [255, 0, 255],
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
  white: [255, 255, 255],
  orange: [255, 128, 0],
};
export const MAGENTA_GREEN = [COLORS.magenta, COLORS.green];
export const RGB = [COLORS.red, COLORS.green, COLORS.blue];
export const CYMRGB = Object.values(COLORS).slice(0, -2);

export async function getJson(store: HTTPStore, key: string) {
  const bytes = new Uint8Array(await store.getItem(key));
  const decoder = new TextDecoder('utf-8');
  const json = JSON.parse(decoder.decode(bytes));
  return json;
}

export function normalizeStore(store: string | HTTPStore) {
  if (typeof store === 'string') {
    return new HTTPStore(store);
  }
  return store;
}

export function omeroToVivProps(imageData: OmeroImageData) {
  const { rdefs, channels } = imageData;
  const t = rdefs.defaultT ?? 0;
  const z = rdefs.defaultZ ?? 0;
  const nChannels = channels.length;
  const loaderSelection = range(nChannels).map((c) => [t, c, z, 0, 0]);

  const colorValues: number[][] = [];
  const sliderValues: number[][] = [];
  const channelIsOn: boolean[] = [];
  const labels: string[] = [];
  channels.forEach((c) => {
    colorValues.push(hexToRGB(c.color));
    sliderValues.push([c.window.start, c.window.end]);
    channelIsOn.push(c.active);
    labels.push(c.label);
  });

  return {
    channel_axis: 1,
    loaderSelection,
    colorValues,
    sliderValues,
    contrastLimits: [...sliderValues],
    channelIsOn,
    labels,
  };
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
