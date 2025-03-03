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
  readonly labels: viv.Labels<S>;
  readonly tileSize: number;
  readonly dtype: viv.SupportedDtype;

  #pendingId: undefined | number = undefined;
  #pending: Array<{
    resolve: (data: viv.PixelData) => void;
    reject: (err: unknown) => void;
    request: {
      selection: Array<number | zarr.Slice>;
      signal?: AbortSignal;
    };
  }> = [];

  constructor(arr: zarr.Array<zarr.DataType, zarr.Readable>, options: { labels: viv.Labels<S>; tileSize: number }) {
    const dtype = capitalize(arr.dtype);
    assert(arr.is("number") && isSupportedDtype(dtype), `Unsupported viv dtype: ${dtype}`);
    this.dtype = dtype;
    this.#arr = arr;
    this.labels = options.labels;
    this.tileSize = options.tileSize;
  }

  get #width() {
    const lastIndex = this.shape.length - 1;
    return this.shape[this.labels.indexOf("c") === lastIndex ? lastIndex - 1 : lastIndex];
  }

  get #height() {
    const lastIndex = this.shape.length - 1;
    return this.shape[this.labels.indexOf("c") === lastIndex ? lastIndex - 2 : lastIndex - 1];
  }

  get shape() {
    return this.#arr.shape;
  }

  async getRaster(options: {
    selection: viv.PixelSourceSelection<S> | Array<number>;
    signal?: AbortSignal;
  }): Promise<viv.PixelData> {
    const { selection, signal } = options;
    return this.#fetchData({
      selection: buildZarrSelection(selection, {
        labels: this.labels,
        slices: { x: zarr.slice(null), y: zarr.slice(null) },
      }),
      signal,
    });
  }

  onTileError(_err: unknown): void {
    // no-op
  }

  async getTile(options: {
    x: number;
    y: number;
    selection: viv.PixelSourceSelection<S> | Array<number>;
    signal?: AbortSignal;
  }): Promise<viv.PixelData> {
    const { x, y, selection, signal } = options;
    return this.#fetchData({
      selection: buildZarrSelection(selection, {
        labels: this.labels,
        slices: {
          x: zarr.slice(x * this.tileSize, Math.min((x + 1) * this.tileSize, this.#width)),
          y: zarr.slice(y * this.tileSize, Math.min((y + 1) * this.tileSize, this.#height)),
        },
      }),
      signal,
    });
  }

  async #fetchData(request: { selection: Array<number | Slice>; signal?: AbortSignal }): Promise<viv.PixelData> {
    const { promise, resolve, reject } = Promise.withResolvers<viv.PixelData>();
    this.#pending.push({ request, resolve, reject });
    this.#pendingId = this.#pendingId ?? requestAnimationFrame(() => this.#fetchPending());
    return promise;
  }

  /**
   * Fetch a pending batch of requests together and resolve independently.
   *
   * TODO: There could be more optimizations (e.g., multi-get)
   */
  async #fetchPending() {
    for (const { request, resolve, reject } of this.#pending) {
      zarr
        .get(this.#arr, request.selection, { opts: { signal: request.signal } })
        .then(({ data, shape }) => {
          if (data instanceof BigInt64Array || data instanceof BigUint64Array) {
            // We need to cast data these typed arrays to something that is viv compatible.
            // See the comment in the constructor for more information.
            data = Uint32Array.from(data, (bint) => Number(bint));
          }
          resolve({
            data: data as viv.SupportedTypedArray,
            width: shape[1],
            height: shape[0],
          });
        })
        .catch((error) => reject(error));
    }
    this.#pendingId = undefined;
    this.#pending = [];
  }
}

function buildZarrSelection(
  baseSelection: Record<string, number> | Array<number>,
  options: {
    labels: string[];
    slices: { x: zarr.Slice; y: zarr.Slice };
  },
): Array<Slice | number> {
  const { labels, slices } = options;
  let selection: Array<Slice | number>;
  if (Array.isArray(baseSelection)) {
    // shallow copy
    selection = [...baseSelection];
  } else {
    // initialize with zeros
    selection = Array.from({ length: labels.length }, () => 0);
    // fill in the selection
    for (const [key, idx] of Object.entries(baseSelection)) {
      selection[labels.indexOf(key)] = idx;
    }
  }
  selection[labels.indexOf(X_AXIS_NAME)] = slices.x;
  selection[labels.indexOf(Y_AXIS_NAME)] = slices.y;
  if (RGBA_CHANNEL_AXIS_NAME in labels) {
    selection[labels.indexOf(RGBA_CHANNEL_AXIS_NAME)] = zarr.slice(null);
  }
  return selection;
}

function capitalize<T extends string>(s: T): Capitalize<T> {
  // @ts-expect-error - TypeScript can't verify that the return type is correct
  return s[0].toUpperCase() + s.slice(1);
}

function isSupportedDtype(dtype: string): dtype is viv.SupportedDtype {
  // @ts-expect-error - TypeScript can't verify that the return type is correct
  return SUPPORTED_DTYPES.includes(dtype);
}
