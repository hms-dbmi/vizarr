import {HTTPStore} from "../web_modules/zarr.js";
export const MAX_CHANNELS = 6;
export const COLORS = {
  cyan: "#00FFFF",
  yellow: "#FFFF00",
  magenta: "#FF00FF",
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
  white: "#FFFFFF"
};
export const MAGENTA_GREEN = [COLORS.magenta, COLORS.green];
export const RGB = [COLORS.red, COLORS.green, COLORS.blue];
export const CYMRGB = Object.values(COLORS).slice(0, -2);
export async function getJson(store, key) {
  const bytes = new Uint8Array(await store.getItem(key));
  const decoder = new TextDecoder("utf-8");
  const json = JSON.parse(decoder.decode(bytes));
  return json;
}
export function normalizeStore(store) {
  if (typeof store === "string") {
    return new HTTPStore(store);
  }
  return store;
}
export function hexToRGB(hex) {
  if (hex.startsWith("#"))
    hex = hex.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}
export function range(length) {
  return Array.from({length}, (_, i) => i);
}
export function rstrip(str, remove = " ") {
  while (str.length > 0 && remove.includes(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1);
  }
  return str;
}
export function join(...args) {
  return args.filter(Boolean).map((s) => rstrip(s, "/")).join("/");
}
