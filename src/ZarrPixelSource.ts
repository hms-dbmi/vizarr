import * as zarr from "zarrita";
import { assert } from "./utils";

import type * as viv from "@vivjs/types";

// TODO: Export from top-level zarrita
type Slice = ReturnType<typeof zarr.slice>;

const X_AXIS_NAME = "x";
const Y_AXIS_NAME = "y";
const RGBA_CHANNEL_AXIS_NAME = "_c";

type VivPixelData = {
  data: zarr.TypedArray<Lowercase<viv.SupportedDtype>>;
  width: number;
  height: number;
};

export class ZarrPixelSource implements viv.PixelSource<Array<string>> {
  readonly labels: viv.Labels<Array<string>>;
  readonly tileSize: number;
  readonly dtype: viv.SupportedDtype;
  readonly #arr: zarr.Array<zarr.NumberDataType | zarr.BigintDataType, zarr.Readable>;
  readonly #transform: (
    arr: zarr.TypedArray<zarr.NumberDataType | zarr.BigintDataType>,
  ) => zarr.TypedArray<Lowercase<viv.SupportedDtype>>;

  #pendingId: undefined | number = undefined;
  #pending: Array<{
    resolve: (data: VivPixelData) => void;
    reject: (err: unknown) => void;
    request: {
      selection: Array<number | zarr.Slice>;
      signal?: AbortSignal;
    };
  }> = [];

  constructor(
    arr: zarr.Array<zarr.DataType, zarr.Readable>,
    options: { labels: viv.Labels<Array<string>>; tileSize: number },
  ) {
    assert(arr.is("number") || arr.is("bigint"), `Unsupported viv dtype: ${arr.dtype}`);
    this.#arr = arr;
    this.labels = options.labels;
    this.tileSize = options.tileSize;
    /**
     * Some `zarrita` data types are not supported by Viv and require casting.
     *
     * Note how the casted type in the transform function is type-cast to `zarr.TypedArray<typeof arr.dtype>`.
     * This ensures that the function body is correct based on whatever type narrowing we do in the if/else
     * blocks based on dtype.
     *
     * TODO: Maybe we should add a console warning?
     */
    if (arr.dtype === "uint64" || arr.dtype === "int64") {
      this.dtype = "Uint32";
      this.#transform = (x) => Uint32Array.from(x as zarr.TypedArray<typeof arr.dtype>, (bint) => Number(bint));
    } else if (arr.dtype === "float16") {
      this.dtype = "Float32";
      this.#transform = (x) => new Float32Array(x as zarr.TypedArray<typeof arr.dtype>);
    } else {
      this.dtype = capitalize(arr.dtype);
      this.#transform = (x) => x as zarr.TypedArray<typeof arr.dtype>;
    }
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
    selection: viv.PixelSourceSelection<Array<string>> | Array<number>;
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
    selection: viv.PixelSourceSelection<Array<string>> | Array<number>;
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
    const { promise, resolve, reject } = Promise.withResolvers<VivPixelData>();
    this.#pending.push({ request, resolve, reject });
    this.#pendingId = this.#pendingId ?? requestAnimationFrame(() => this.#fetchPending());
    // @ts-expect-error - The missing generic ArrayBuffer type from Viv makes VivPixelData and viv.PixelData incompatible, even though they are.
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
          resolve({
            data: this.#transform(data),
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
