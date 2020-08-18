import { HTTPStore } from 'zarr';

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

export async function getJson(store: HTTPStore, key: string) {
  const bytes = new Uint8Array(await store.getItem(key));
  const decoder = new TextDecoder('utf-8');
  const json = JSON.parse(decoder.decode(bytes));
  return json;
}

export function normalizeStore(store: string | HTTPStore): HTTPStore {
  if (typeof store === 'string') {
    return new HTTPStore(store);
  }
  return store;
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
