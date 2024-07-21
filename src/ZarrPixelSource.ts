import * as zarr from "zarrita";

import type * as viv from "@vivjs/types";
import type { Readable } from "@zarrita/storage";

import { getImageSize } from "@hms-dbmi/viv";
import { assert } from "./utils";

// TODO: Export from top-level zarrita
type Slice = ReturnType<typeof zarr.slice>;

const X_AXIS_NAME = "x";
const Y_AXIS_NAME = "y";
const RGBA_CHANNEL_AXIS_NAME = "_c";
const SUPPORTED_DTYPES = ["Uint8", "Uint16", "Uint32", "Float32", "Int8", "Int16", "Int32", "Float64"] as const;

export class ZarrPixelSource<S extends Array<string> = Array<string>> implements viv.PixelSource<S> {
  #arr: zarr.Array<zarr.DataType, Readable>;
  readonly labels: viv.Labels<S>;
  readonly tileSize: number;
  readonly dtype: viv.SupportedDtype;

  constructor(
    arr: zarr.Array<zarr.DataType, Readable>,
    options: {
      labels: viv.Labels<S>;
      tileSize: number;
    },
  ) {
    this.#arr = arr;
    this.labels = options.labels;
    this.tileSize = options.tileSize;
    const vivDtype = capitalize(arr.dtype);
    assert(isSupportedDtype(vivDtype), `Unsupported viv dtype: ${vivDtype}`);
    this.dtype = vivDtype;
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
    const {
      data,
      shape: [height, width],
    } = await zarr.get(this.#arr, selection, {
      // @ts-expect-error this is ok for now and should be supported by all backends
      signal: options.signal,
    });
    return { data: data as viv.SupportedTypedArray, width, height };
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
