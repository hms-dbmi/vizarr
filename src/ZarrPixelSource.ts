import { getImageSize } from "@hms-dbmi/viv";
import * as zarr from "zarrita";
import { assert } from "./utils";

import type * as viv from "@vivjs/types";

// TODO: Export from top-level zarrita
type Slice = ReturnType<typeof zarr.slice>;

const X_AXIS_NAME = "x";
const Y_AXIS_NAME = "y";
const RGBA_CHANNEL_AXIS_NAME = "_c";
const SUPPORTED_DTYPES = ["Uint8", "Uint16", "Uint32", "Float32", "Int8", "Int16", "Int32", "Float64"] as const;

export class ZarrPixelSource<S extends Array<string> = Array<string>> implements viv.PixelSource<S> {
  #arr: zarr.Array<zarr.NumberDataType, zarr.Readable>;
  #dataCompat = (x: zarr.TypedArray<zarr.NumberDataType>) => x;

  readonly labels: viv.Labels<S>;
  readonly tileSize: number;
  readonly dtype: viv.SupportedDtype;

  constructor(
    arr: zarr.Array<zarr.DataType, zarr.Readable>,
    options: {
      labels: viv.Labels<S>;
      tileSize: number;
    },
  ) {
    const vivDtype = capitalize(arr.dtype);
    assert(arr.is("number") && isSupportedDtype(vivDtype), `Unsupported viv dtype: ${vivDtype}`);
    this.#arr = arr;
    this.labels = options.labels;
    this.tileSize = options.tileSize;

    // NOTE: Trevor(2025-02-27): Viv 0.17 introduced new GL constants that are not
    // supported by WebGL. Specifically, certain texture formats (e.g., r8int) are
    // incompatible, causing errors when rendering. This workaround ensures
    // compatibility by casting unsupported data types (e.g., Int8) to a
    // supported equivalent (Uint8).
    if (vivDtype === "Int8") {
      // FIXME: This could overflow and is not a safe cast.
      this.dtype = "Uint8";
      this.#dataCompat = (x) => new Uint8Array(x);
    } else {
      this.dtype = vivDtype;
      this.#dataCompat = (x) => x;
    }
  }

  get shape() {
    return this.#arr.shape;
  }

  async getRaster(options: {
    selection: viv.PixelSourceSelection<S> | Array<number>;
    signal?: AbortSignal;
  }): Promise<viv.PixelData> {
    const { selection, signal } = options;
    return this.#fetchData(buildZarrQuery(this.labels, selection), { signal });
  }

  async getTile(options: {
    x: number;
    y: number;
    selection: viv.PixelSourceSelection<S> | Array<number>;
    signal?: AbortSignal;
  }): Promise<viv.PixelData> {
    const { x, y, selection, signal } = options;
    const sel = buildZarrQuery(this.labels, selection);

    const { height, width } = getImageSize(this);
    const [xStart, xStop] = [x * this.tileSize, Math.min((x + 1) * this.tileSize, width)];
    const [yStart, yStop] = [y * this.tileSize, Math.min((y + 1) * this.tileSize, height)];

    // Deck.gl can sometimes request edge tiles that don't exist. We throw
    // a BoundsCheckError which is picked up in `ZarrPixelSource.onTileError`
    // and ignored by deck.gl.
    if (xStart === xStop || yStart === yStop) {
      throw new BoundsCheckError("Tile slice is zero-sized.");
    }
    if (xStart < 0 || yStart < 0 || xStop > width || yStop > height) {
      throw new BoundsCheckError("Tile slice is out of bounds.");
    }

    sel[this.labels.indexOf(X_AXIS_NAME)] = zarr.slice(xStart, xStop);
    sel[this.labels.indexOf(Y_AXIS_NAME)] = zarr.slice(yStart, yStop);
    return this.#fetchData(sel, { signal });
  }

  onTileError(err: Error): void {
    if (err instanceof BoundsCheckError) {
      return;
    }
    throw err;
  }

  async #fetchData(selection: Array<number | Slice>, options: { signal?: AbortSignal }): Promise<viv.PixelData> {
    const chunk = await zarr.get(this.#arr, selection, {
      // @ts-expect-error this is ok for now and should be supported by all backends
      signal: options.signal,
    });
    return {
      data: this.#dataCompat(chunk.data) as viv.SupportedTypedArray,
      width: chunk.shape[1],
      height: chunk.shape[0],
    };
  }
}

function buildZarrQuery(labels: string[], selection: Record<string, number> | Array<number>): Array<Slice | number> {
  let sel: Array<Slice | number>;
  if (Array.isArray(selection)) {
    // shallow copy
    sel = [...selection];
  } else {
    // initialize with zeros
    sel = Array.from({ length: labels.length }, () => 0);
    // fill in the selection
    for (const [key, idx] of Object.entries(selection)) {
      sel[labels.indexOf(key)] = idx;
    }
  }
  sel[labels.indexOf(X_AXIS_NAME)] = zarr.slice(null);
  sel[labels.indexOf(Y_AXIS_NAME)] = zarr.slice(null);
  if (RGBA_CHANNEL_AXIS_NAME in labels) {
    sel[labels.indexOf(RGBA_CHANNEL_AXIS_NAME)] = zarr.slice(null);
  }
  return sel;
}

function capitalize<T extends string>(s: T): Capitalize<T> {
  // @ts-expect-error - TypeScript can't verify that the return type is correct
  return s[0].toUpperCase() + s.slice(1);
}

function isSupportedDtype(dtype: string): dtype is viv.SupportedDtype {
  // @ts-expect-error - TypeScript can't verify that the return type is correct
  return SUPPORTED_DTYPES.includes(dtype);
}

class BoundsCheckError extends Error {
  name = "BoundsCheckError";
}
