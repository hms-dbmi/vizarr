import {ContainsArrayError, HTTPStore, openArray, openGroup, ZarrArray} from "../_snowpack/pkg/zarr.js";
import {Matrix4} from "../_snowpack/pkg/@math.gl/core/dist/esm.js";
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
async function normalizeStore(source) {
  if (typeof source === "string") {
    if (source.endsWith(".json")) {
      const {ReferenceStore} = await import("../_snowpack/pkg/reference-spec-reader.js");
      return ReferenceStore.fromJSON(await fetch(source).then((res) => res.json()));
    }
    return new HTTPStore(source);
  }
  return source;
}
export async function open(source) {
  const store = await normalizeStore(source);
  return openGroup(store).catch((err) => {
    if (err instanceof ContainsArrayError) {
      return openArray({store});
    }
    throw err;
  });
}
export async function loadMultiscales(grp, multiscales) {
  const {datasets} = multiscales[0] || [{path: "0"}];
  const nodes = await Promise.all(datasets.map(({path}) => grp.getItem(path)));
  if (nodes.every((node) => node instanceof ZarrArray)) {
    return nodes;
  }
  throw Error("Multiscales metadata included a path to a group.");
}
export function nested(store) {
  const get = (target, key) => {
    if (key === "getItem" || key === "containsItem") {
      return (path, ...args) => {
        if (path.endsWith(".zarray") || path.endsWith(".zattrs") || path.endsWith(".zgroup")) {
          return target[key](path, ...args);
        }
        const prefix = path.split("/");
        const chunkKey = prefix.pop();
        const newPath = [...prefix, chunkKey.replaceAll(".", "/")].join("/");
        return target[key](newPath, ...args);
      };
    }
    return Reflect.get(target, key);
  };
  return new Proxy(store, {get});
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
export function getAxisLabels(arr, axis_labels) {
  if (!axis_labels || axis_labels.length != arr.shape.length) {
    const nonXYaxisLabels = arr.shape.slice(0, -2).map((_, i) => "" + i);
    axis_labels = nonXYaxisLabels.concat(["y", "x"]);
  }
  return axis_labels;
}
export function isInterleaved(shape) {
  const lastDimSize = shape[shape.length - 1];
  return lastDimSize === 3 || lastDimSize === 4;
}
export function guessTileSize(arr) {
  const interleaved = isInterleaved(arr.shape);
  const [ySize, xSize] = arr.chunks.slice(interleaved ? -3 : -2);
  const size = Math.min(ySize, xSize);
  return 2 ** Math.floor(Math.log2(size));
}
export function fitBounds([width, height], [targetWidth, targetHeight], maxZoom, padding) {
  const scaleX = (targetWidth - padding * 2) / width;
  const scaleY = (targetHeight - padding * 2) / height;
  const zoom = Math.min(maxZoom, Math.log2(Math.min(scaleX, scaleY)));
  return {zoom, target: [width / 2, height / 2, 0]};
}
function isArray16(o) {
  if (!Array.isArray(o))
    return false;
  return o.length === 16 && o.every((i) => typeof i === "number");
}
export function parseMatrix(model_matrix) {
  if (!model_matrix)
    return new Matrix4();
  const matrix = new Matrix4();
  try {
    const arr = typeof model_matrix === "string" ? JSON.parse(model_matrix) : model_matrix;
    if (!isArray16(arr)) {
      throw Error("Invalid modelMatrix size. Must be 16.");
    }
    matrix.setRowMajor(...arr);
  } catch {
    const msg = `Failed to parse modelMatrix. Got ${JSON.stringify(model_matrix)}, using identity.`;
    console.warn(msg);
  }
  return matrix;
}
