import * as zarr from 'zarrita';
import { DTYPE_VALUES } from '@vivjs/constants';

import type * as viv from '@vivjs/types';
import type { Readable } from '@zarrita/storage';

import { assert } from './utils';
import { getImageSize } from '@hms-dbmi/viv';

// TODO: Export from top-level zarrita
type Slice = ReturnType<typeof zarr.slice>;

const xKey = 'x';
const yKey = 'y';
const rgbaChannelKey = '_c';

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
    }
  ) {
    this.#arr = arr;
    this.labels = options.labels;
    this.tileSize = options.tileSize;
    const vivDtype = capitalize(arr.dtype);
    assert(isSupportedDtype(vivDtype), `Unsupported dtype: ${vivDtype}`);
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
      throw new BoundsCheckError('Tile slice is zero-sized.');
    }
    if (xStart < 0 || yStart < 0 || xStop > width || yStop > height) {
      throw new BoundsCheckError('Tile slice is out of bounds.');
    }

    sel[this.labels.indexOf(xKey)] = zarr.slice(xStart, xStop);
    sel[this.labels.indexOf(yKey)] = zarr.slice(yStart, yStop);
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
  sel[labels.indexOf(xKey)] = zarr.slice(null);
  sel[labels.indexOf(xKey)] = zarr.slice(null);
  if (rgbaChannelKey in labels) {
    sel[labels.indexOf(rgbaChannelKey)] = zarr.slice(null);
  }
  return sel;
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function isSupportedDtype(dtype: string): dtype is viv.SupportedDtype {
  return dtype in DTYPE_VALUES;
}

class BoundsCheckError extends Error {
  name = 'BoundsCheckError';
  constructor(message?: string) {
    super(message);
  }
}
