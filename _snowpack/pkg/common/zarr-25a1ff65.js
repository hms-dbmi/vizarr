import { p as process } from './process-2545f00a.js';

const registry = new Map();
function addCodec(id, importFn) {
  registry.set(id, importFn);
}
async function getCodec(config) {
  if (!registry.has(config.id)) {
    throw new Error(`Compression codec ${config.id} is not supported by Zarr.js yet.`);
  }
  const codec = await registry.get(config.id)();
  return codec.fromConfig(config);
}
function createProxy(mapping) {
  return new Proxy(mapping, {
    set(target, key, value, _receiver) {
      return target.setItem(key, value);
    },
    get(target, key, _receiver) {
      return target.getItem(key);
    },
    deleteProperty(target, key) {
      return target.deleteItem(key);
    },
    has(target, key) {
      return target.containsItem(key);
    }
  });
}
function isZarrError(err) {
  return typeof err === "object" && err !== null && "__zarr__" in err;
}
function isKeyError(o) {
  return isZarrError(o) && o.__zarr__ === "KeyError";
}
class ContainsArrayError extends Error {
  constructor(path) {
    super(`path ${path} contains an array`);
    this.__zarr__ = "ContainsArrayError";
    Object.setPrototypeOf(this, ContainsArrayError.prototype);
  }
}
class ContainsGroupError extends Error {
  constructor(path) {
    super(`path ${path} contains a group`);
    this.__zarr__ = "ContainsGroupError";
    Object.setPrototypeOf(this, ContainsGroupError.prototype);
  }
}
class ArrayNotFoundError extends Error {
  constructor(path) {
    super(`array not found at path ${path}`);
    this.__zarr__ = "ArrayNotFoundError";
    Object.setPrototypeOf(this, ArrayNotFoundError.prototype);
  }
}
class GroupNotFoundError extends Error {
  constructor(path) {
    super(`ground not found at path ${path}`);
    this.__zarr__ = "GroupNotFoundError";
    Object.setPrototypeOf(this, GroupNotFoundError.prototype);
  }
}
class PermissionError extends Error {
  constructor(message) {
    super(message);
    this.__zarr__ = "PermissionError";
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}
class KeyError extends Error {
  constructor(key) {
    super(`key ${key} not present`);
    this.__zarr__ = "KeyError";
    Object.setPrototypeOf(this, KeyError.prototype);
  }
}
class TooManyIndicesError extends RangeError {
  constructor(selection, shape) {
    super(`too many indices for array; expected ${shape.length}, got ${selection.length}`);
    this.__zarr__ = "TooManyIndicesError";
    Object.setPrototypeOf(this, TooManyIndicesError.prototype);
  }
}
class BoundsCheckError extends RangeError {
  constructor(message) {
    super(message);
    this.__zarr__ = "BoundsCheckError";
    Object.setPrototypeOf(this, BoundsCheckError.prototype);
  }
}
class InvalidSliceError extends RangeError {
  constructor(from, to, stepSize, reason) {
    super(`slice arguments slice(${from}, ${to}, ${stepSize}) invalid: ${reason}`);
    this.__zarr__ = "InvalidSliceError";
    Object.setPrototypeOf(this, InvalidSliceError.prototype);
  }
}
class NegativeStepError extends Error {
  constructor() {
    super(`Negative step size is not supported when indexing.`);
    this.__zarr__ = "NegativeStepError";
    Object.setPrototypeOf(this, NegativeStepError.prototype);
  }
}
class ValueError extends Error {
  constructor(message) {
    super(message);
    this.__zarr__ = "ValueError";
    Object.setPrototypeOf(this, ValueError.prototype);
  }
}
class HTTPError extends Error {
  constructor(code) {
    super(code);
    this.__zarr__ = "HTTPError";
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}
function slice(start, stop = void 0, step = null) {
  if (start === void 0) {
    throw new InvalidSliceError(start, stop, step, "The first argument must not be undefined");
  }
  if (typeof start === "string" && start !== ":" || typeof stop === "string" && stop !== ":") {
    throw new InvalidSliceError(start, stop, step, 'Arguments can only be integers, ":" or null');
  }
  if (stop === void 0) {
    stop = start;
    start = null;
  }
  return {
    start: start === ":" ? null : start,
    stop: stop === ":" ? null : stop,
    step,
    _slice: true
  };
}
function adjustIndices(start, stop, step, length) {
  if (start < 0) {
    start += length;
    if (start < 0) {
      start = step < 0 ? -1 : 0;
    }
  } else if (start >= length) {
    start = step < 0 ? length - 1 : length;
  }
  if (stop < 0) {
    stop += length;
    if (stop < 0) {
      stop = step < 0 ? -1 : 0;
    }
  } else if (stop >= length) {
    stop = step < 0 ? length - 1 : length;
  }
  if (step < 0) {
    if (stop < start) {
      const length2 = Math.floor((start - stop - 1) / -step + 1);
      return [start, stop, step, length2];
    }
  } else {
    if (start < stop) {
      const length2 = Math.floor((stop - start - 1) / step + 1);
      return [start, stop, step, length2];
    }
  }
  return [start, stop, step, 0];
}
function sliceIndices(slice2, length) {
  let start;
  let stop;
  let step;
  if (slice2.step === null) {
    step = 1;
  } else {
    step = slice2.step;
  }
  if (slice2.start === null) {
    start = step < 0 ? Number.MAX_SAFE_INTEGER : 0;
  } else {
    start = slice2.start;
    if (start < 0) {
      start += length;
    }
  }
  if (slice2.stop === null) {
    stop = step < 0 ? -Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
  } else {
    stop = slice2.stop;
    if (stop < 0) {
      stop += length;
    }
  }
  const s = adjustIndices(start, stop, step, length);
  start = s[0];
  stop = s[1];
  step = s[2];
  length = s[3];
  if (step === 0)
    throw new Error("Step size 0 is invalid");
  return [start, stop, step, length];
}
function ensureArray(selection) {
  if (!Array.isArray(selection)) {
    return [selection];
  }
  return selection;
}
function checkSelectionLength(selection, shape) {
  if (selection.length > shape.length) {
    throw new TooManyIndicesError(selection, shape);
  }
}
function selectionToSliceIndices(selection, shape) {
  const sliceIndicesResult = [];
  const outShape = [];
  for (let i = 0; i < selection.length; i++) {
    const s = selection[i];
    if (typeof s === "number") {
      sliceIndicesResult.push(s);
    } else {
      const x = sliceIndices(s, shape[i]);
      const dimLength = x[3];
      outShape.push(dimLength);
      sliceIndicesResult.push(x);
    }
  }
  return [sliceIndicesResult, outShape];
}
function normalizeArraySelection(selection, shape, convertIntegerSelectionToSlices = false) {
  selection = replaceEllipsis(selection, shape);
  for (let i = 0; i < selection.length; i++) {
    const dimSelection = selection[i];
    if (typeof dimSelection === "number") {
      if (convertIntegerSelectionToSlices) {
        selection[i] = slice(dimSelection, dimSelection + 1, 1);
      } else {
        selection[i] = normalizeIntegerSelection(dimSelection, shape[i]);
      }
    } else if (isIntegerArray(dimSelection)) {
      throw new TypeError("Integer array selections are not supported (yet)");
    } else if (dimSelection === ":" || dimSelection === null) {
      selection[i] = slice(null, null, 1);
    }
  }
  return selection;
}
function replaceEllipsis(selection, shape) {
  selection = ensureArray(selection);
  let ellipsisIndex = -1;
  let numEllipsis = 0;
  for (let i = 0; i < selection.length; i++) {
    if (selection[i] === "...") {
      ellipsisIndex = i;
      numEllipsis += 1;
    }
  }
  if (numEllipsis > 1) {
    throw new RangeError("an index can only have a single ellipsis ('...')");
  }
  if (numEllipsis === 1) {
    const numItemsLeft = ellipsisIndex;
    const numItemsRight = selection.length - (numItemsLeft + 1);
    const numItems = selection.length - 1;
    if (numItems >= shape.length) {
      selection = selection.filter((x) => x !== "...");
    } else {
      const numNewItems = shape.length - numItems;
      let newItem = selection.slice(0, numItemsLeft).concat(new Array(numNewItems).fill(null));
      if (numItemsRight > 0) {
        newItem = newItem.concat(selection.slice(selection.length - numItemsRight));
      }
      selection = newItem;
    }
  }
  if (selection.length < shape.length) {
    const numMissing = shape.length - selection.length;
    selection = selection.concat(new Array(numMissing).fill(null));
  }
  checkSelectionLength(selection, shape);
  return selection;
}
function normalizeIntegerSelection(dimSelection, dimLength) {
  if (dimSelection < 0) {
    dimSelection = dimLength + dimSelection;
  }
  if (dimSelection >= dimLength || dimSelection < 0) {
    throw new BoundsCheckError(`index out of bounds for dimension with length ${dimLength}`);
  }
  return dimSelection;
}
function isInteger(s) {
  return typeof s === "number";
}
function isIntegerArray(s) {
  if (!Array.isArray(s)) {
    return false;
  }
  for (const e of s) {
    if (typeof e !== "number") {
      return false;
    }
  }
  return true;
}
function isSlice(s) {
  if (s !== null && s["_slice"] === true) {
    return true;
  }
  return false;
}
function isContiguousSlice(s) {
  return isSlice(s) && (s.step === null || s.step === 1);
}
function isContiguousSelection(selection) {
  selection = ensureArray(selection);
  for (let i = 0; i < selection.length; i++) {
    const s = selection[i];
    if (!(isIntegerArray(s) || isContiguousSlice(s) || s === "...")) {
      return false;
    }
  }
  return true;
}
function* product(...iterables) {
  if (iterables.length === 0) {
    return;
  }
  const iterators = iterables.map((it) => it());
  const results = iterators.map((it) => it.next());
  for (let i = 0; ; ) {
    if (results[i].done) {
      iterators[i] = iterables[i]();
      results[i] = iterators[i].next();
      if (++i >= iterators.length) {
        return;
      }
    } else {
      yield results.map(({value}) => value);
      i = 0;
    }
    results[i] = iterators[i].next();
  }
}
class BasicIndexer {
  constructor(selection, array2) {
    selection = normalizeArraySelection(selection, array2.shape);
    this.dimIndexers = [];
    const arrayShape = array2.shape;
    for (let i = 0; i < arrayShape.length; i++) {
      let dimSelection = selection[i];
      const dimLength = arrayShape[i];
      const dimChunkLength = array2.chunks[i];
      if (dimSelection === null) {
        dimSelection = slice(null);
      }
      if (isInteger(dimSelection)) {
        this.dimIndexers.push(new IntDimIndexer(dimSelection, dimLength, dimChunkLength));
      } else if (isSlice(dimSelection)) {
        this.dimIndexers.push(new SliceDimIndexer(dimSelection, dimLength, dimChunkLength));
      } else {
        throw new RangeError(`Unspported selection item for basic indexing; expected integer or slice, got ${dimSelection}`);
      }
    }
    this.shape = [];
    for (const d of this.dimIndexers) {
      if (d instanceof SliceDimIndexer) {
        this.shape.push(d.numItems);
      }
    }
    this.dropAxes = null;
  }
  *iter() {
    const dimIndexerIterables = this.dimIndexers.map((x) => () => x.iter());
    const dimIndexerProduct = product(...dimIndexerIterables);
    for (const dimProjections of dimIndexerProduct) {
      const chunkCoords = [];
      const chunkSelection = [];
      const outSelection = [];
      for (const p of dimProjections) {
        chunkCoords.push(p.dimChunkIndex);
        chunkSelection.push(p.dimChunkSelection);
        if (p.dimOutSelection !== null) {
          outSelection.push(p.dimOutSelection);
        }
      }
      yield {
        chunkCoords,
        chunkSelection,
        outSelection
      };
    }
  }
}
class IntDimIndexer {
  constructor(dimSelection, dimLength, dimChunkLength) {
    dimSelection = normalizeIntegerSelection(dimSelection, dimLength);
    this.dimSelection = dimSelection;
    this.dimLength = dimLength;
    this.dimChunkLength = dimChunkLength;
    this.numItems = 1;
  }
  *iter() {
    const dimChunkIndex = Math.floor(this.dimSelection / this.dimChunkLength);
    const dimOffset = dimChunkIndex * this.dimChunkLength;
    const dimChunkSelection = this.dimSelection - dimOffset;
    const dimOutSelection = null;
    yield {
      dimChunkIndex,
      dimChunkSelection,
      dimOutSelection
    };
  }
}
class SliceDimIndexer {
  constructor(dimSelection, dimLength, dimChunkLength) {
    const [start, stop, step] = sliceIndices(dimSelection, dimLength);
    this.start = start;
    this.stop = stop;
    this.step = step;
    if (this.step < 1) {
      throw new NegativeStepError();
    }
    this.dimLength = dimLength;
    this.dimChunkLength = dimChunkLength;
    this.numItems = Math.max(0, Math.ceil((this.stop - this.start) / this.step));
    this.numChunks = Math.ceil(this.dimLength / this.dimChunkLength);
  }
  *iter() {
    const dimChunkIndexFrom = Math.floor(this.start / this.dimChunkLength);
    const dimChunkIndexTo = Math.ceil(this.stop / this.dimChunkLength);
    for (let dimChunkIndex = dimChunkIndexFrom; dimChunkIndex < dimChunkIndexTo; dimChunkIndex++) {
      const dimOffset = dimChunkIndex * this.dimChunkLength;
      const dimLimit = Math.min(this.dimLength, (dimChunkIndex + 1) * this.dimChunkLength);
      const dimChunkLength = dimLimit - dimOffset;
      let dimChunkSelStart;
      let dimChunkSelStop;
      let dimOutOffset;
      if (this.start < dimOffset) {
        dimChunkSelStart = 0;
        const remainder = (dimOffset - this.start) % this.step;
        if (remainder > 0) {
          dimChunkSelStart += this.step - remainder;
        }
        dimOutOffset = Math.ceil((dimOffset - this.start) / this.step);
      } else {
        dimChunkSelStart = this.start - dimOffset;
        dimOutOffset = 0;
      }
      if (this.stop > dimLimit) {
        dimChunkSelStop = dimChunkLength;
      } else {
        dimChunkSelStop = this.stop - dimOffset;
      }
      const dimChunkSelection = slice(dimChunkSelStart, dimChunkSelStop, this.step);
      const dimChunkNumItems = Math.ceil((dimChunkSelStop - dimChunkSelStart) / this.step);
      const dimOutSelection = slice(dimOutOffset, dimOutOffset + dimChunkNumItems);
      yield {
        dimChunkIndex,
        dimChunkSelection,
        dimOutSelection
      };
    }
  }
}
const IS_NODE = typeof process !== "undefined" && process.versions && process.versions.node;
function normalizeStoragePath(path) {
  if (path === null) {
    return "";
  }
  if (path instanceof String) {
    path = path.valueOf();
  }
  path = path.replace(/\\/g, "/");
  while (path.length > 0 && path[0] === "/") {
    path = path.slice(1);
  }
  while (path.length > 0 && path[path.length - 1] === "/") {
    path = path.slice(0, path.length - 1);
  }
  path = path.replace(/\/\/+/g, "/");
  const segments = path.split("/");
  for (const s of segments) {
    if (s === "." || s === "..") {
      throw Error("path containing '.' or '..' segment not allowed");
    }
  }
  return path;
}
function normalizeShape(shape) {
  if (typeof shape === "number") {
    shape = [shape];
  }
  return shape.map((x) => Math.floor(x));
}
function normalizeChunks(chunks, shape) {
  if (chunks === null || chunks === true) {
    throw new Error("Chunk guessing is not supported yet");
  }
  if (chunks === false) {
    return shape;
  }
  if (typeof chunks === "number") {
    chunks = [chunks];
  }
  if (chunks.length < shape.length) {
    chunks = chunks.concat(shape.slice(chunks.length));
  }
  return chunks.map((x, idx) => {
    if (x === -1 || x === null) {
      return shape[idx];
    } else {
      return Math.floor(x);
    }
  });
}
function normalizeOrder(order) {
  order = order.toUpperCase();
  return order;
}
function normalizeDtype(dtype) {
  return dtype;
}
function normalizeFillValue(fillValue) {
  return fillValue;
}
function isTotalSlice(item, shape) {
  if (item === null) {
    return true;
  }
  if (!Array.isArray(item)) {
    item = [item];
  }
  for (let i = 0; i < Math.min(item.length, shape.length); i++) {
    const it = item[i];
    if (it === null)
      continue;
    if (isSlice(it)) {
      const s = it;
      const isStepOne = s.step === 1 || s.step === null;
      if (s.start === null && s.stop === null && isStepOne) {
        continue;
      }
      if (s.stop - s.start === shape[i] && isStepOne) {
        continue;
      }
      return false;
    }
    return false;
  }
  return true;
}
function arrayEquals1D(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function getStrides(shape) {
  const ndim = shape.length;
  const strides = Array(ndim);
  let step = 1;
  for (let i = ndim - 1; i >= 0; i--) {
    strides[i] = step;
    step *= shape[i];
  }
  return strides;
}
function joinUrlParts(...args) {
  return args.map((part, i) => {
    if (i === 0) {
      return part.trim().replace(/[\/]*$/g, "");
    } else {
      return part.trim().replace(/(^[\/]*|[\/]*$)/g, "");
    }
  }).filter((x) => x.length).join("/");
}
function byteSwapInplace(src) {
  const b = src.BYTES_PER_ELEMENT;
  if (b === 1)
    return;
  if (IS_NODE) {
    const bytes = Buffer.from(src.buffer, src.byteOffset, src.length * b);
    if (b === 2)
      bytes.swap16();
    if (b === 4)
      bytes.swap32();
    if (b === 8)
      bytes.swap64();
    return;
  }
  const flipper = new Uint8Array(src.buffer, src.byteOffset, src.length * b);
  const numFlips = b / 2;
  const endByteIndex = b - 1;
  let t;
  for (let i = 0; i < flipper.length; i += b) {
    for (let j = 0; j < numFlips; j++) {
      t = flipper[i + j];
      flipper[i + j] = flipper[i + endByteIndex - j];
      flipper[i + endByteIndex - j] = t;
    }
  }
}
function byteSwap(src) {
  const copy = src.slice();
  byteSwapInplace(copy);
  return copy;
}
const ARRAY_META_KEY = ".zarray";
const GROUP_META_KEY = ".zgroup";
const ATTRS_META_KEY = ".zattrs";
async function containsArray(store, path = null) {
  path = normalizeStoragePath(path);
  const prefix = pathToPrefix(path);
  const key = prefix + ARRAY_META_KEY;
  return store.containsItem(key);
}
async function containsGroup(store, path = null) {
  path = normalizeStoragePath(path);
  const prefix = pathToPrefix(path);
  const key = prefix + GROUP_META_KEY;
  return store.containsItem(key);
}
function pathToPrefix(path) {
  if (path.length > 0) {
    return path + "/";
  }
  return "";
}
async function requireParentGroup(store, path, chunkStore, overwrite) {
  if (path.length === 0) {
    return;
  }
  const segments = path.split("/");
  let p = "";
  for (const s of segments.slice(0, segments.length - 1)) {
    p += s;
    if (await containsArray(store, p)) {
      await initGroupMetadata(store, p, overwrite);
    } else if (!await containsGroup(store, p)) {
      await initGroupMetadata(store, p);
    }
    p += "/";
  }
}
async function initGroupMetadata(store, path = null, overwrite = false) {
  path = normalizeStoragePath(path);
  if (overwrite) {
    throw Error("Group overwriting not implemented yet :(");
  } else if (await containsArray(store, path)) {
    throw new ContainsArrayError(path);
  } else if (await containsGroup(store, path)) {
    throw new ContainsGroupError(path);
  }
  const metadata = {zarr_format: 2};
  const key = pathToPrefix(path) + GROUP_META_KEY;
  await store.setItem(key, JSON.stringify(metadata));
}
async function initGroup(store, path = null, chunkStore = null, overwrite = false) {
  path = normalizeStoragePath(path);
  await requireParentGroup(store, path, chunkStore, overwrite);
  await initGroupMetadata(store, path, overwrite);
}
async function initArrayMetadata(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters, dimensionSeparator) {
  if (overwrite) {
    throw Error("Array overwriting not implemented yet :(");
  } else if (await containsArray(store, path)) {
    throw new ContainsArrayError(path);
  } else if (await containsGroup(store, path)) {
    throw new ContainsGroupError(path);
  }
  dtype = normalizeDtype(dtype);
  shape = normalizeShape(shape);
  chunks = normalizeChunks(chunks, shape);
  order = normalizeOrder(order);
  fillValue = normalizeFillValue(fillValue);
  if (filters !== null && filters.length > 0) {
    throw Error("Filters are not supported yet");
  }
  let serializedFillValue = fillValue;
  if (typeof fillValue === "number") {
    if (Number.isNaN(fillValue))
      serializedFillValue = "NaN";
    if (Number.POSITIVE_INFINITY === fillValue)
      serializedFillValue = "Infinity";
    if (Number.NEGATIVE_INFINITY === fillValue)
      serializedFillValue = "-Infinity";
  }
  filters = null;
  const metadata = {
    zarr_format: 2,
    shape,
    chunks,
    dtype,
    fill_value: serializedFillValue,
    order,
    compressor,
    filters
  };
  if (dimensionSeparator) {
    metadata.dimension_separator = dimensionSeparator;
  }
  const metaKey = pathToPrefix(path) + ARRAY_META_KEY;
  await store.setItem(metaKey, JSON.stringify(metadata));
}
async function initArray(store, shape, chunks, dtype, path = null, compressor = null, fillValue = null, order = "C", overwrite = false, chunkStore = null, filters = null, dimensionSeparator) {
  path = normalizeStoragePath(path);
  await requireParentGroup(store, path, chunkStore, overwrite);
  await initArrayMetadata(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters, dimensionSeparator);
}
function parseMetadata(s) {
  if (typeof s !== "string") {
    if (IS_NODE && Buffer.isBuffer(s)) {
      return JSON.parse(s.toString());
    } else if (s instanceof ArrayBuffer) {
      const utf8Decoder = new TextDecoder();
      const bytes = new Uint8Array(s);
      return JSON.parse(utf8Decoder.decode(bytes));
    } else {
      return s;
    }
  }
  return JSON.parse(s);
}
class Attributes {
  constructor(store, key, readOnly, cache = true) {
    this.store = store;
    this.key = key;
    this.readOnly = readOnly;
    this.cache = cache;
    this.cachedValue = null;
  }
  async asObject() {
    if (this.cache && this.cachedValue !== null) {
      return this.cachedValue;
    }
    const o = await this.getNoSync();
    if (this.cache) {
      this.cachedValue = o;
    }
    return o;
  }
  async getNoSync() {
    try {
      const data = await this.store.getItem(this.key);
      return parseMetadata(data);
    } catch (error) {
      return {};
    }
  }
  async setNoSync(key, value) {
    const d = await this.getNoSync();
    d[key] = value;
    await this.putNoSync(d);
    return true;
  }
  async putNoSync(m) {
    await this.store.setItem(this.key, JSON.stringify(m));
    if (this.cache) {
      this.cachedValue = m;
    }
  }
  async delNoSync(key) {
    const d = await this.getNoSync();
    delete d[key];
    await this.putNoSync(d);
    return true;
  }
  async put(d) {
    if (this.readOnly) {
      throw new PermissionError("attributes are read-only");
    }
    return this.putNoSync(d);
  }
  async setItem(key, value) {
    if (this.readOnly) {
      throw new PermissionError("attributes are read-only");
    }
    return this.setNoSync(key, value);
  }
  async getItem(key) {
    return (await this.asObject())[key];
  }
  async deleteItem(key) {
    if (this.readOnly) {
      throw new PermissionError("attributes are read-only");
    }
    return this.delNoSync(key);
  }
  async containsItem(key) {
    return (await this.asObject())[key] !== void 0;
  }
  proxy() {
    return createProxy(this);
  }
}
const DTYPE_TYPEDARRAY_MAPPING = {
  "|b": Int8Array,
  "|B": Uint8Array,
  "|u1": Uint8Array,
  "|i1": Int8Array,
  "<b": Int8Array,
  "<B": Uint8Array,
  "<u1": Uint8Array,
  "<i1": Int8Array,
  "<u2": Uint16Array,
  "<i2": Int16Array,
  "<u4": Uint32Array,
  "<i4": Int32Array,
  "<f4": Float32Array,
  "<f8": Float64Array,
  ">b": Int8Array,
  ">B": Uint8Array,
  ">u1": Uint8Array,
  ">i1": Int8Array,
  ">u2": Uint16Array,
  ">i2": Int16Array,
  ">u4": Uint32Array,
  ">i4": Int32Array,
  ">f4": Float32Array,
  ">f8": Float64Array
};
function getTypedArrayCtr(dtype) {
  const ctr = DTYPE_TYPEDARRAY_MAPPING[dtype];
  if (!ctr) {
    throw Error(`Dtype not recognized or not supported in zarr.js, got ${dtype}.`);
  }
  return ctr;
}
function getTypedArrayDtypeString(t) {
  if (t instanceof Uint8Array)
    return "|u1";
  if (t instanceof Int8Array)
    return "|i1";
  if (t instanceof Uint16Array)
    return "<u2";
  if (t instanceof Int16Array)
    return "<i2";
  if (t instanceof Uint32Array)
    return "<u4";
  if (t instanceof Int32Array)
    return "<i4";
  if (t instanceof Float32Array)
    return "<f4";
  if (t instanceof Float64Array)
    return "<f8";
  throw new ValueError("Mapping for TypedArray to Dtypestring not known");
}
function getNestedArrayConstructor(arr) {
  if (arr.byteLength !== void 0) {
    return arr.constructor;
  }
  return getNestedArrayConstructor(arr[0]);
}
function sliceNestedArray(arr, shape, selection) {
  const normalizedSelection = normalizeArraySelection(selection, shape);
  const [sliceIndices2, outShape] = selectionToSliceIndices(normalizedSelection, shape);
  const outArray = _sliceNestedArray(arr, shape, sliceIndices2);
  return [outArray, outShape];
}
function _sliceNestedArray(arr, shape, selection) {
  const currentSlice = selection[0];
  if (typeof currentSlice === "number") {
    if (shape.length === 1) {
      return arr[currentSlice];
    } else {
      return _sliceNestedArray(arr[currentSlice], shape.slice(1), selection.slice(1));
    }
  }
  const [from, to, step, outputSize] = currentSlice;
  if (outputSize === 0) {
    return new (getNestedArrayConstructor(arr))(0);
  }
  if (shape.length === 1) {
    if (step === 1) {
      return arr.slice(from, to);
    }
    const newArrData = new arr.constructor(outputSize);
    for (let i = 0; i < outputSize; i++) {
      newArrData[i] = arr[from + i * step];
    }
    return newArrData;
  }
  let newArr = new Array(outputSize);
  for (let i = 0; i < outputSize; i++) {
    newArr[i] = _sliceNestedArray(arr[from + i * step], shape.slice(1), selection.slice(1));
  }
  if (outputSize > 0 && typeof newArr[0] === "number") {
    const typedArrayConstructor = arr[0].constructor;
    newArr = typedArrayConstructor.from(newArr);
  }
  return newArr;
}
function setNestedArrayToScalar(dstArr, value, destShape, selection) {
  const normalizedSelection = normalizeArraySelection(selection, destShape, true);
  const [sliceIndices2, _outShape] = selectionToSliceIndices(normalizedSelection, destShape);
  _setNestedArrayToScalar(dstArr, value, destShape, sliceIndices2);
}
function setNestedArray(dstArr, sourceArr, destShape, sourceShape, selection) {
  const normalizedSelection = normalizeArraySelection(selection, destShape, false);
  const [sliceIndices2, outShape] = selectionToSliceIndices(normalizedSelection, destShape);
  if (JSON.stringify(outShape) !== JSON.stringify(sourceShape)) {
    throw new ValueError(`Shape mismatch in target and source NestedArray: ${outShape} and ${sourceShape}`);
  }
  _setNestedArray(dstArr, sourceArr, destShape, sliceIndices2);
}
function _setNestedArray(dstArr, sourceArr, shape, selection) {
  const currentSlice = selection[0];
  if (typeof sourceArr === "number") {
    _setNestedArrayToScalar(dstArr, sourceArr, shape, selection.map((x) => typeof x === "number" ? [x, x + 1, 1, 1] : x));
    return;
  }
  if (typeof currentSlice === "number") {
    _setNestedArray(dstArr[currentSlice], sourceArr, shape.slice(1), selection.slice(1));
    return;
  }
  const [from, _to, step, outputSize] = currentSlice;
  if (shape.length === 1) {
    if (step === 1) {
      dstArr.set(sourceArr, from);
    } else {
      for (let i = 0; i < outputSize; i++) {
        dstArr[from + i * step] = sourceArr[i];
      }
    }
    return;
  }
  for (let i = 0; i < outputSize; i++) {
    _setNestedArray(dstArr[from + i * step], sourceArr[i], shape.slice(1), selection.slice(1));
  }
}
function _setNestedArrayToScalar(dstArr, value, shape, selection) {
  const currentSlice = selection[0];
  const [from, to, step, outputSize] = currentSlice;
  if (shape.length === 1) {
    if (step === 1) {
      dstArr.fill(value, from, to);
    } else {
      for (let i = 0; i < outputSize; i++) {
        dstArr[from + i * step] = value;
      }
    }
    return;
  }
  for (let i = 0; i < outputSize; i++) {
    _setNestedArrayToScalar(dstArr[from + i * step], value, shape.slice(1), selection.slice(1));
  }
}
function flattenNestedArray(arr, shape, constr) {
  if (constr === void 0) {
    constr = getNestedArrayConstructor(arr);
  }
  const size = shape.reduce((x, y) => x * y, 1);
  const outArr = new constr(size);
  _flattenNestedArray(arr, shape, outArr, 0);
  return outArr;
}
function _flattenNestedArray(arr, shape, outArr, offset) {
  if (shape.length === 1) {
    outArr.set(arr, offset);
    return;
  }
  if (shape.length === 2) {
    for (let i = 0; i < shape[0]; i++) {
      outArr.set(arr[i], offset + shape[1] * i);
    }
    return arr;
  }
  const nextShape = shape.slice(1);
  const mult = nextShape.reduce((x, y) => x * y, 1);
  for (let i = 0; i < shape[0]; i++) {
    _flattenNestedArray(arr[i], nextShape, outArr, offset + mult * i);
  }
  return arr;
}
class NestedArray {
  constructor(data, shape, dtype) {
    const dataIsTypedArray = data !== null && !!data.BYTES_PER_ELEMENT;
    if (shape === void 0) {
      if (!dataIsTypedArray) {
        throw new ValueError("Shape argument is required unless you pass in a TypedArray");
      }
      shape = [data.length];
    }
    if (dtype === void 0) {
      if (!dataIsTypedArray) {
        throw new ValueError("Dtype argument is required unless you pass in a TypedArray");
      }
      dtype = getTypedArrayDtypeString(data);
    }
    shape = normalizeShape(shape);
    this.shape = shape;
    this.dtype = dtype;
    if (dataIsTypedArray && shape.length !== 1) {
      data = data.buffer;
    }
    if (this.shape.length === 0) {
      this.data = new (getTypedArrayCtr(dtype))(1);
    } else if (IS_NODE && Buffer.isBuffer(data) || data instanceof ArrayBuffer || data === null || data.toString().startsWith("[object ArrayBuffer]")) {
      const numShapeElements = shape.reduce((x, y) => x * y, 1);
      if (data === null) {
        data = new ArrayBuffer(numShapeElements * parseInt(dtype[dtype.length - 1], 10));
      }
      const numDataElements = data.byteLength / parseInt(dtype[dtype.length - 1], 10);
      if (numShapeElements !== numDataElements) {
        throw new Error(`Buffer has ${numDataElements} of dtype ${dtype}, shape is too large or small ${shape} (flat=${numShapeElements})`);
      }
      const typeConstructor = getTypedArrayCtr(dtype);
      this.data = createNestedArray(data, typeConstructor, shape);
    } else {
      this.data = data;
    }
  }
  get(selection) {
    const [sliceResult, outShape] = sliceNestedArray(this.data, this.shape, selection);
    if (outShape.length === 0) {
      return sliceResult;
    } else {
      return new NestedArray(sliceResult, outShape, this.dtype);
    }
  }
  set(selection = null, value) {
    if (selection === null) {
      selection = [slice(null)];
    }
    if (typeof value === "number") {
      if (this.shape.length === 0) {
        this.data[0] = value;
      } else {
        setNestedArrayToScalar(this.data, value, this.shape, selection);
      }
    } else {
      setNestedArray(this.data, value.data, this.shape, value.shape, selection);
    }
  }
  flatten() {
    if (this.shape.length === 1) {
      return this.data;
    }
    return flattenNestedArray(this.data, this.shape, getTypedArrayCtr(this.dtype));
  }
  static arange(size, dtype = "<i4") {
    const constr = getTypedArrayCtr(dtype);
    const data = rangeTypedArray([size], constr);
    return new NestedArray(data, [size], dtype);
  }
}
function rangeTypedArray(shape, tContructor) {
  const size = shape.reduce((x, y) => x * y, 1);
  const data = new tContructor(size);
  data.set([...Array(size).keys()]);
  return data;
}
function createNestedArray(data, t, shape, offset = 0) {
  if (shape.length === 1) {
    return new t(data.slice(offset, offset + shape[0] * t.BYTES_PER_ELEMENT));
  }
  const arr = new Array(shape[0]);
  if (shape.length === 2) {
    for (let i = 0; i < shape[0]; i++) {
      arr[i] = new t(data.slice(offset + shape[1] * i * t.BYTES_PER_ELEMENT, offset + shape[1] * (i + 1) * t.BYTES_PER_ELEMENT));
    }
    return arr;
  }
  const nextShape = shape.slice(1);
  const mult = nextShape.reduce((x, y) => x * y, 1);
  for (let i = 0; i < shape[0]; i++) {
    arr[i] = createNestedArray(data, t, nextShape, offset + mult * i * t.BYTES_PER_ELEMENT);
  }
  return arr;
}
function setRawArrayToScalar(dstArr, dstStrides, dstShape, dstSelection, value) {
  const normalizedSelection = normalizeArraySelection(dstSelection, dstShape, true);
  const [sliceIndices2] = selectionToSliceIndices(normalizedSelection, dstShape);
  _setRawArrayToScalar(value, dstArr, dstStrides, sliceIndices2);
}
function setRawArray(dstArr, dstStrides, dstShape, dstSelection, sourceArr, sourceStrides, sourceShape) {
  const normalizedDstSelection = normalizeArraySelection(dstSelection, dstShape, false);
  const [dstSliceIndices, outShape] = selectionToSliceIndices(normalizedDstSelection, dstShape);
  if (JSON.stringify(outShape) !== JSON.stringify(sourceShape)) {
    throw new ValueError(`Shape mismatch in target and source RawArray: ${outShape} and ${sourceShape}`);
  }
  _setRawArray(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides);
}
function setRawArrayFromChunkItem(dstArr, dstStrides, dstShape, dstSelection, sourceArr, sourceStrides, sourceShape, sourceSelection) {
  const normalizedDstSelection = normalizeArraySelection(dstSelection, dstShape, true);
  const [dstSliceIndices] = selectionToSliceIndices(normalizedDstSelection, dstShape);
  const normalizedSourceSelection = normalizeArraySelection(sourceSelection, sourceShape, false);
  const [sourceSliceIndicies] = selectionToSliceIndices(normalizedSourceSelection, sourceShape);
  _setRawArrayFromChunkItem(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides, sourceSliceIndicies);
}
function _setRawArrayToScalar(value, dstArr, dstStrides, dstSliceIndices) {
  const [currentDstSlice, ...nextDstSliceIndices] = dstSliceIndices;
  const [currentDstStride, ...nextDstStrides] = dstStrides;
  const [from, _to, step, outputSize] = currentDstSlice;
  if (dstStrides.length === 1) {
    if (step === 1 && currentDstStride === 1) {
      dstArr.fill(value, from, from + outputSize);
    } else {
      for (let i = 0; i < outputSize; i++) {
        dstArr[currentDstStride * (from + step * i)] = value;
      }
    }
    return;
  }
  for (let i = 0; i < outputSize; i++) {
    _setRawArrayToScalar(value, dstArr.subarray(currentDstStride * (from + step * i)), nextDstStrides, nextDstSliceIndices);
  }
}
function _setRawArray(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides) {
  if (dstSliceIndices.length === 0) {
    dstArr.set(sourceArr);
    return;
  }
  const [currentDstSlice, ...nextDstSliceIndices] = dstSliceIndices;
  const [currentDstStride, ...nextDstStrides] = dstStrides;
  if (typeof currentDstSlice === "number") {
    _setRawArray(dstArr.subarray(currentDstSlice * currentDstStride), nextDstStrides, nextDstSliceIndices, sourceArr, sourceStrides);
    return;
  }
  const [currentSourceStride, ...nextSourceStrides] = sourceStrides;
  const [from, _to, step, outputSize] = currentDstSlice;
  if (dstStrides.length === 1) {
    if (step === 1 && currentDstStride === 1 && currentSourceStride === 1) {
      dstArr.set(sourceArr.subarray(0, outputSize), from);
    } else {
      for (let i = 0; i < outputSize; i++) {
        dstArr[currentDstStride * (from + step * i)] = sourceArr[currentSourceStride * i];
      }
    }
    return;
  }
  for (let i = 0; i < outputSize; i++) {
    _setRawArray(dstArr.subarray(currentDstStride * (from + i * step)), nextDstStrides, nextDstSliceIndices, sourceArr.subarray(currentSourceStride * i), nextSourceStrides);
  }
}
function _setRawArrayFromChunkItem(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides, sourceSliceIndices) {
  if (sourceSliceIndices.length === 0) {
    dstArr.set(sourceArr.subarray(0, dstArr.length));
    return;
  }
  const [currentDstSlice, ...nextDstSliceIndices] = dstSliceIndices;
  const [currentSourceSlice, ...nextSourceSliceIndices] = sourceSliceIndices;
  const [currentDstStride, ...nextDstStrides] = dstStrides;
  const [currentSourceStride, ...nextSourceStrides] = sourceStrides;
  if (typeof currentSourceSlice === "number") {
    _setRawArrayFromChunkItem(dstArr, dstStrides, dstSliceIndices, sourceArr.subarray(currentSourceStride * currentSourceSlice), nextSourceStrides, nextSourceSliceIndices);
    return;
  }
  const [from, _to, step, outputSize] = currentDstSlice;
  const [sfrom, _sto, sstep, _soutputSize] = currentSourceSlice;
  if (dstStrides.length === 1 && sourceStrides.length === 1) {
    if (step === 1 && currentDstStride === 1 && sstep === 1 && currentSourceStride === 1) {
      dstArr.set(sourceArr.subarray(sfrom, sfrom + outputSize), from);
    } else {
      for (let i = 0; i < outputSize; i++) {
        dstArr[currentDstStride * (from + step * i)] = sourceArr[currentSourceStride * (sfrom + sstep * i)];
      }
    }
    return;
  }
  for (let i = 0; i < outputSize; i++) {
    _setRawArrayFromChunkItem(dstArr.subarray(currentDstStride * (from + i * step)), nextDstStrides, nextDstSliceIndices, sourceArr.subarray(currentSourceStride * (sfrom + i * sstep)), nextSourceStrides, nextSourceSliceIndices);
  }
}
class RawArray {
  constructor(data, shape, dtype, strides) {
    const dataIsTypedArray = data !== null && !!data.BYTES_PER_ELEMENT;
    if (shape === void 0) {
      if (!dataIsTypedArray) {
        throw new ValueError("Shape argument is required unless you pass in a TypedArray");
      }
      shape = [data.length];
    }
    shape = normalizeShape(shape);
    if (dtype === void 0) {
      if (!dataIsTypedArray) {
        throw new ValueError("Dtype argument is required unless you pass in a TypedArray");
      }
      dtype = getTypedArrayDtypeString(data);
    }
    if (strides === void 0) {
      strides = getStrides(shape);
    }
    this.shape = shape;
    this.dtype = dtype;
    this.strides = strides;
    if (dataIsTypedArray && shape.length !== 1) {
      data = data.buffer;
    }
    if (this.shape.length === 0) {
      this.data = new (getTypedArrayCtr(dtype))(1);
    } else if (IS_NODE && Buffer.isBuffer(data) || data instanceof ArrayBuffer || data === null || data.toString().startsWith("[object ArrayBuffer]")) {
      const numShapeElements = shape.reduce((x, y) => x * y, 1);
      if (data === null) {
        data = new ArrayBuffer(numShapeElements * parseInt(dtype[dtype.length - 1], 10));
      }
      const numDataElements = data.byteLength / parseInt(dtype[dtype.length - 1], 10);
      if (numShapeElements !== numDataElements) {
        throw new Error(`Buffer has ${numDataElements} of dtype ${dtype}, shape is too large or small ${shape} (flat=${numShapeElements})`);
      }
      const typeConstructor = getTypedArrayCtr(dtype);
      this.data = new typeConstructor(data);
    } else {
      this.data = data;
    }
  }
  set(selection = null, value, chunkSelection) {
    if (selection === null) {
      selection = [slice(null)];
    }
    if (typeof value === "number") {
      if (this.shape.length === 0) {
        this.data[0] = value;
      } else {
        setRawArrayToScalar(this.data, this.strides, this.shape, selection, value);
      }
    } else if (value instanceof RawArray && chunkSelection) {
      setRawArrayFromChunkItem(this.data, this.strides, this.shape, selection, value.data, value.strides, value.shape, chunkSelection);
    } else {
      setRawArray(this.data, this.strides, this.shape, selection, value.data, value.strides, value.shape);
    }
  }
}
function createCommonjsModule(fn) {
  var module = {exports: {}};
  return fn(module, module.exports), module.exports;
}
var eventemitter3 = createCommonjsModule(function(module) {
  var has = Object.prototype.hasOwnProperty, prefix = "~";
  function Events() {
  }
  if (Object.create) {
    Events.prototype = Object.create(null);
    if (!new Events().__proto__)
      prefix = false;
  }
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new Events();
    else
      delete emitter._events[evt];
  }
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events = this._events) {
      if (has.call(events, name))
        names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers = this._events[evt];
    if (!handlers)
      return [];
    if (handlers.fn)
      return [handlers.fn];
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }
    return ee;
  };
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners)
      return 0;
    if (listeners.fn)
      return 1;
    return listeners.length;
  };
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return false;
    var listeners = this._events[evt], len = arguments.length, args, i;
    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j;
      for (i = 0; i < length; i++) {
        if (listeners[i].once)
          this.removeListener(event, listeners[i].fn, void 0, true);
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else
        clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt])
        clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;
  EventEmitter.prefixed = prefix;
  EventEmitter.EventEmitter = EventEmitter;
  {
    module.exports = EventEmitter;
  }
});
var pFinally = (promise, onFinally) => {
  onFinally = onFinally || (() => {
  });
  return promise.then((val) => new Promise((resolve) => {
    resolve(onFinally());
  }).then(() => val), (err) => new Promise((resolve) => {
    resolve(onFinally());
  }).then(() => {
    throw err;
  }));
};
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
  }
}
const pTimeout = (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
  if (typeof milliseconds !== "number" || milliseconds < 0) {
    throw new TypeError("Expected `milliseconds` to be a positive number");
  }
  if (milliseconds === Infinity) {
    resolve(promise);
    return;
  }
  const timer = setTimeout(() => {
    if (typeof fallback === "function") {
      try {
        resolve(fallback());
      } catch (error) {
        reject(error);
      }
      return;
    }
    const message = typeof fallback === "string" ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
    const timeoutError2 = fallback instanceof Error ? fallback : new TimeoutError(message);
    if (typeof promise.cancel === "function") {
      promise.cancel();
    }
    reject(timeoutError2);
  }, milliseconds);
  pFinally(promise.then(resolve, reject), () => {
    clearTimeout(timer);
  });
});
var pTimeout_1 = pTimeout;
var _default$3 = pTimeout;
var TimeoutError_1 = TimeoutError;
pTimeout_1.default = _default$3;
pTimeout_1.TimeoutError = TimeoutError_1;
function lowerBound(array2, value, comparator) {
  let first = 0;
  let count = array2.length;
  while (count > 0) {
    const step = count / 2 | 0;
    let it = first + step;
    if (comparator(array2[it], value) <= 0) {
      first = ++it;
      count -= step + 1;
    } else {
      count = step;
    }
  }
  return first;
}
var _default$2 = lowerBound;
var lowerBound_1 = /* @__PURE__ */ Object.defineProperty({
  default: _default$2
}, "__esModule", {value: true});
class PriorityQueue {
  constructor() {
    this._queue = [];
  }
  enqueue(run, options) {
    options = Object.assign({priority: 0}, options);
    const element = {
      priority: options.priority,
      run
    };
    if (this.size && this._queue[this.size - 1].priority >= options.priority) {
      this._queue.push(element);
      return;
    }
    const index = lowerBound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
    this._queue.splice(index, 0, element);
  }
  dequeue() {
    const item = this._queue.shift();
    return item && item.run;
  }
  get size() {
    return this._queue.length;
  }
}
var _default$1 = PriorityQueue;
var priorityQueue = /* @__PURE__ */ Object.defineProperty({
  default: _default$1
}, "__esModule", {value: true});
const empty$1 = () => {
};
const timeoutError = new pTimeout_1.default.TimeoutError();
class PQueue extends eventemitter3 {
  constructor(options) {
    super();
    this._intervalCount = 0;
    this._intervalEnd = 0;
    this._pendingCount = 0;
    this._resolveEmpty = empty$1;
    this._resolveIdle = empty$1;
    options = Object.assign({carryoverConcurrencyCount: false, intervalCap: Infinity, interval: 0, concurrency: Infinity, autoStart: true, queueClass: priorityQueue.default}, options);
    if (!(typeof options.intervalCap === "number" && options.intervalCap >= 1)) {
      throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${options.intervalCap}\` (${typeof options.intervalCap})`);
    }
    if (options.interval === void 0 || !(Number.isFinite(options.interval) && options.interval >= 0)) {
      throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${options.interval}\` (${typeof options.interval})`);
    }
    this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
    this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
    this._intervalCap = options.intervalCap;
    this._interval = options.interval;
    this._queue = new options.queueClass();
    this._queueClass = options.queueClass;
    this.concurrency = options.concurrency;
    this._timeout = options.timeout;
    this._throwOnTimeout = options.throwOnTimeout === true;
    this._isPaused = options.autoStart === false;
  }
  get _doesIntervalAllowAnother() {
    return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
  }
  get _doesConcurrentAllowAnother() {
    return this._pendingCount < this._concurrency;
  }
  _next() {
    this._pendingCount--;
    this._tryToStartAnother();
  }
  _resolvePromises() {
    this._resolveEmpty();
    this._resolveEmpty = empty$1;
    if (this._pendingCount === 0) {
      this._resolveIdle();
      this._resolveIdle = empty$1;
    }
  }
  _onResumeInterval() {
    this._onInterval();
    this._initializeIntervalIfNeeded();
    this._timeoutId = void 0;
  }
  _isIntervalPaused() {
    const now = Date.now();
    if (this._intervalId === void 0) {
      const delay = this._intervalEnd - now;
      if (delay < 0) {
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
      } else {
        if (this._timeoutId === void 0) {
          this._timeoutId = setTimeout(() => {
            this._onResumeInterval();
          }, delay);
        }
        return true;
      }
    }
    return false;
  }
  _tryToStartAnother() {
    if (this._queue.size === 0) {
      if (this._intervalId) {
        clearInterval(this._intervalId);
      }
      this._intervalId = void 0;
      this._resolvePromises();
      return false;
    }
    if (!this._isPaused) {
      const canInitializeInterval = !this._isIntervalPaused();
      if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
        this.emit("active");
        this._queue.dequeue()();
        if (canInitializeInterval) {
          this._initializeIntervalIfNeeded();
        }
        return true;
      }
    }
    return false;
  }
  _initializeIntervalIfNeeded() {
    if (this._isIntervalIgnored || this._intervalId !== void 0) {
      return;
    }
    this._intervalId = setInterval(() => {
      this._onInterval();
    }, this._interval);
    this._intervalEnd = Date.now() + this._interval;
  }
  _onInterval() {
    if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = void 0;
    }
    this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
    this._processQueue();
  }
  _processQueue() {
    while (this._tryToStartAnother()) {
    }
  }
  get concurrency() {
    return this._concurrency;
  }
  set concurrency(newConcurrency) {
    if (!(typeof newConcurrency === "number" && newConcurrency >= 1)) {
      throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
    }
    this._concurrency = newConcurrency;
    this._processQueue();
  }
  async add(fn, options = {}) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this._pendingCount++;
        this._intervalCount++;
        try {
          const operation = this._timeout === void 0 && options.timeout === void 0 ? fn() : pTimeout_1.default(Promise.resolve(fn()), options.timeout === void 0 ? this._timeout : options.timeout, () => {
            if (options.throwOnTimeout === void 0 ? this._throwOnTimeout : options.throwOnTimeout) {
              reject(timeoutError);
            }
            return void 0;
          });
          resolve(await operation);
        } catch (error) {
          reject(error);
        }
        this._next();
      };
      this._queue.enqueue(run, options);
      this._tryToStartAnother();
    });
  }
  async addAll(functions, options) {
    return Promise.all(functions.map(async (function_) => this.add(function_, options)));
  }
  start() {
    if (!this._isPaused) {
      return this;
    }
    this._isPaused = false;
    this._processQueue();
    return this;
  }
  pause() {
    this._isPaused = true;
  }
  clear() {
    this._queue = new this._queueClass();
  }
  async onEmpty() {
    if (this._queue.size === 0) {
      return;
    }
    return new Promise((resolve) => {
      const existingResolve = this._resolveEmpty;
      this._resolveEmpty = () => {
        existingResolve();
        resolve();
      };
    });
  }
  async onIdle() {
    if (this._pendingCount === 0 && this._queue.size === 0) {
      return;
    }
    return new Promise((resolve) => {
      const existingResolve = this._resolveIdle;
      this._resolveIdle = () => {
        existingResolve();
        resolve();
      };
    });
  }
  get size() {
    return this._queue.size;
  }
  get pending() {
    return this._pendingCount;
  }
  get isPaused() {
    return this._isPaused;
  }
  set timeout(milliseconds) {
    this._timeout = milliseconds;
  }
  get timeout() {
    return this._timeout;
  }
}
var _default = PQueue;
class ZarrArray {
  constructor(store, path = null, metadata, readOnly = false, chunkStore = null, cacheMetadata = true, cacheAttrs = true) {
    this.store = store;
    this._chunkStore = chunkStore;
    this.path = normalizeStoragePath(path);
    this.keyPrefix = pathToPrefix(this.path);
    this.readOnly = readOnly;
    this.cacheMetadata = cacheMetadata;
    this.cacheAttrs = cacheAttrs;
    this.meta = metadata;
    if (this.meta.compressor !== null) {
      this.compressor = getCodec(this.meta.compressor);
    } else {
      this.compressor = null;
    }
    const attrKey = this.keyPrefix + ATTRS_META_KEY;
    this.attrs = new Attributes(this.store, attrKey, this.readOnly, cacheAttrs);
  }
  get chunkStore() {
    if (this._chunkStore) {
      return this._chunkStore;
    }
    return this.store;
  }
  get name() {
    if (this.path.length > 0) {
      if (this.path[0] !== "/") {
        return "/" + this.path;
      }
      return this.path;
    }
    return null;
  }
  get basename() {
    const name = this.name;
    if (name === null) {
      return null;
    }
    const parts = name.split("/");
    return parts[parts.length - 1];
  }
  get shape() {
    return this.meta.shape;
  }
  get chunks() {
    return this.meta.chunks;
  }
  get chunkSize() {
    return this.chunks.reduce((x, y) => x * y, 1);
  }
  get dtype() {
    return this.meta.dtype;
  }
  get fillValue() {
    const fillTypeValue = this.meta.fill_value;
    if (fillTypeValue === "NaN") {
      return NaN;
    } else if (fillTypeValue === "Infinity") {
      return Infinity;
    } else if (fillTypeValue === "-Infinity") {
      return -Infinity;
    }
    return this.meta.fill_value;
  }
  get nDims() {
    return this.meta.shape.length;
  }
  get size() {
    return this.meta.shape.reduce((x, y) => x * y, 1);
  }
  get length() {
    return this.shape[0];
  }
  get _chunkDataShape() {
    if (this.shape === []) {
      return [1];
    } else {
      const s = [];
      for (let i = 0; i < this.shape.length; i++) {
        s[i] = Math.ceil(this.shape[i] / this.chunks[i]);
      }
      return s;
    }
  }
  get chunkDataShape() {
    return this._chunkDataShape;
  }
  get numChunks() {
    return this.chunkDataShape.reduce((x, y) => x * y, 1);
  }
  static async create(store, path = null, readOnly = false, chunkStore = null, cacheMetadata = true, cacheAttrs = true) {
    const metadata = await this.loadMetadataForConstructor(store, path);
    return new ZarrArray(store, path, metadata, readOnly, chunkStore, cacheMetadata, cacheAttrs);
  }
  static async loadMetadataForConstructor(store, path) {
    try {
      path = normalizeStoragePath(path);
      const keyPrefix = pathToPrefix(path);
      const metaStoreValue = await store.getItem(keyPrefix + ARRAY_META_KEY);
      return parseMetadata(metaStoreValue);
    } catch (error) {
      if (await containsGroup(store, path)) {
        throw new ContainsGroupError(path !== null && path !== void 0 ? path : "");
      }
      throw new Error("Failed to load metadata for ZarrArray:" + error.toString());
    }
  }
  async reloadMetadata() {
    const metaKey = this.keyPrefix + ARRAY_META_KEY;
    const metaStoreValue = this.store.getItem(metaKey);
    this.meta = parseMetadata(await metaStoreValue);
    return this.meta;
  }
  async refreshMetadata() {
    if (!this.cacheMetadata) {
      await this.reloadMetadata();
    }
  }
  get(selection = null, opts = {}) {
    return this.getBasicSelection(selection, false, opts);
  }
  getRaw(selection = null, opts = {}) {
    return this.getBasicSelection(selection, true, opts);
  }
  async getBasicSelection(selection, asRaw = false, {concurrencyLimit = 10, progressCallback} = {}) {
    if (!this.cacheMetadata) {
      await this.reloadMetadata();
    }
    if (this.shape === []) {
      throw new Error("Shape [] indexing is not supported yet");
    } else {
      return this.getBasicSelectionND(selection, asRaw, concurrencyLimit, progressCallback);
    }
  }
  getBasicSelectionND(selection, asRaw, concurrencyLimit, progressCallback) {
    const indexer = new BasicIndexer(selection, this);
    return this.getSelection(indexer, asRaw, concurrencyLimit, progressCallback);
  }
  async getSelection(indexer, asRaw, concurrencyLimit, progressCallback) {
    const outDtype = this.dtype;
    const outShape = indexer.shape;
    const outSize = indexer.shape.reduce((x, y) => x * y, 1);
    if (asRaw && outSize === this.chunkSize) {
      const itr = indexer.iter();
      const proj = itr.next();
      if (proj.done === false && itr.next().done === true) {
        const chunkProjection = proj.value;
        const out2 = await this.decodeDirectToRawArray(chunkProjection, outShape, outSize);
        return out2;
      }
    }
    const out = asRaw ? new RawArray(null, outShape, outDtype) : new NestedArray(null, outShape, outDtype);
    if (outSize === 0) {
      return out;
    }
    const queue = new _default({concurrency: concurrencyLimit});
    if (progressCallback) {
      let progress = 0;
      let queueSize = 0;
      for (const _ of indexer.iter())
        queueSize += 1;
      progressCallback({progress: 0, queueSize});
      for (const proj of indexer.iter()) {
        (async () => {
          await queue.add(() => this.chunkGetItem(proj.chunkCoords, proj.chunkSelection, out, proj.outSelection, indexer.dropAxes));
          progress += 1;
          progressCallback({progress, queueSize});
        })();
      }
    } else {
      for (const proj of indexer.iter()) {
        queue.add(() => this.chunkGetItem(proj.chunkCoords, proj.chunkSelection, out, proj.outSelection, indexer.dropAxes));
      }
    }
    await queue.onIdle();
    if (out.shape.length === 0) {
      return out.data[0];
    }
    return out;
  }
  async chunkGetItem(chunkCoords, chunkSelection, out, outSelection, dropAxes) {
    if (chunkCoords.length !== this._chunkDataShape.length) {
      throw new ValueError(`Inconsistent shapes: chunkCoordsLength: ${chunkCoords.length}, cDataShapeLength: ${this.chunkDataShape.length}`);
    }
    const cKey = this.chunkKey(chunkCoords);
    try {
      const cdata = await this.chunkStore.getItem(cKey);
      const decodedChunk = await this.decodeChunk(cdata);
      if (out instanceof NestedArray) {
        if (isContiguousSelection(outSelection) && isTotalSlice(chunkSelection, this.chunks) && !this.meta.filters) {
          out.set(outSelection, this.toNestedArray(decodedChunk));
          return;
        }
        const chunk = this.toNestedArray(decodedChunk);
        const tmp = chunk.get(chunkSelection);
        if (dropAxes !== null) {
          throw new Error("Drop axes is not supported yet");
        }
        out.set(outSelection, tmp);
      } else {
        out.set(outSelection, this.chunkBufferToRawArray(decodedChunk), chunkSelection);
      }
    } catch (error) {
      if (isKeyError(error)) {
        if (this.fillValue !== null) {
          out.set(outSelection, this.fillValue);
        }
      } else {
        throw error;
      }
    }
  }
  async getRawChunk(chunkCoords, opts) {
    if (chunkCoords.length !== this.shape.length) {
      throw new Error(`Chunk coordinates ${chunkCoords.join(".")} do not correspond to shape ${this.shape}.`);
    }
    try {
      for (let i = 0; i < chunkCoords.length; i++) {
        const dimLength = Math.ceil(this.shape[i] / this.chunks[i]);
        chunkCoords[i] = normalizeIntegerSelection(chunkCoords[i], dimLength);
      }
    } catch (error) {
      if (error instanceof BoundsCheckError) {
        throw new BoundsCheckError(`index ${chunkCoords.join(".")} is out of bounds for shape: ${this.shape} and chunks ${this.chunks}`);
      } else {
        throw error;
      }
    }
    const cKey = this.chunkKey(chunkCoords);
    const cdata = this.chunkStore.getItem(cKey, opts === null || opts === void 0 ? void 0 : opts.storeOptions);
    const buffer = await this.decodeChunk(await cdata);
    const outShape = this.chunks.filter((d) => d !== 1);
    return new RawArray(buffer, outShape, this.dtype);
  }
  chunkKey(chunkCoords) {
    var _a;
    const sep = (_a = this.meta.dimension_separator) !== null && _a !== void 0 ? _a : ".";
    return this.keyPrefix + chunkCoords.join(sep);
  }
  ensureByteArray(chunkData) {
    if (typeof chunkData === "string") {
      return new Uint8Array(Buffer.from(chunkData).buffer);
    }
    return new Uint8Array(chunkData);
  }
  toTypedArray(buffer) {
    return new (getTypedArrayCtr(this.dtype))(buffer);
  }
  toNestedArray(data) {
    const buffer = this.ensureByteArray(data).buffer;
    return new NestedArray(buffer, this.chunks, this.dtype);
  }
  async decodeChunk(chunkData) {
    let bytes = this.ensureByteArray(chunkData);
    if (this.compressor !== null) {
      bytes = await (await this.compressor).decode(bytes);
    }
    if (this.dtype.includes(">")) {
      byteSwapInplace(this.toTypedArray(bytes.buffer));
    }
    return bytes.buffer;
  }
  chunkBufferToRawArray(buffer) {
    return new RawArray(buffer, this.chunks, this.dtype);
  }
  async decodeDirectToRawArray({chunkCoords}, outShape, outSize) {
    const cKey = this.chunkKey(chunkCoords);
    try {
      const cdata = await this.chunkStore.getItem(cKey);
      return new RawArray(await this.decodeChunk(cdata), outShape, this.dtype);
    } catch (error) {
      if (isKeyError(error)) {
        const data = new (getTypedArrayCtr(this.dtype))(outSize);
        return new RawArray(data.fill(this.fillValue), outShape);
      } else {
        throw error;
      }
    }
  }
  async set(selection = null, value, opts = {}) {
    await this.setBasicSelection(selection, value, opts);
  }
  async setBasicSelection(selection, value, {concurrencyLimit = 10, progressCallback} = {}) {
    if (this.readOnly) {
      throw new PermissionError("Object is read only");
    }
    if (!this.cacheMetadata) {
      await this.reloadMetadata();
    }
    if (this.shape === []) {
      throw new Error("Shape [] indexing is not supported yet");
    } else {
      await this.setBasicSelectionND(selection, value, concurrencyLimit, progressCallback);
    }
  }
  async setBasicSelectionND(selection, value, concurrencyLimit, progressCallback) {
    const indexer = new BasicIndexer(selection, this);
    await this.setSelection(indexer, value, concurrencyLimit, progressCallback);
  }
  getChunkValue(proj, indexer, value, selectionShape) {
    let chunkValue;
    if (selectionShape === []) {
      chunkValue = value;
    } else if (typeof value === "number") {
      chunkValue = value;
    } else {
      chunkValue = value.get(proj.outSelection);
      if (indexer.dropAxes !== null) {
        throw new Error("Handling drop axes not supported yet");
      }
    }
    return chunkValue;
  }
  async setSelection(indexer, value, concurrencyLimit, progressCallback) {
    const selectionShape = indexer.shape;
    if (selectionShape === [])
      ;
    else if (typeof value === "number")
      ;
    else if (value instanceof NestedArray) {
      if (!arrayEquals1D(value.shape, selectionShape)) {
        throw new ValueError(`Shape mismatch in source NestedArray and set selection: ${value.shape} and ${selectionShape}`);
      }
    } else {
      throw new Error("Unknown data type for setting :(");
    }
    const queue = new _default({concurrency: concurrencyLimit});
    if (progressCallback) {
      let queueSize = 0;
      for (const _ of indexer.iter())
        queueSize += 1;
      let progress = 0;
      progressCallback({progress: 0, queueSize});
      for (const proj of indexer.iter()) {
        const chunkValue = this.getChunkValue(proj, indexer, value, selectionShape);
        (async () => {
          await queue.add(() => this.chunkSetItem(proj.chunkCoords, proj.chunkSelection, chunkValue));
          progress += 1;
          progressCallback({progress, queueSize});
        })();
      }
    } else {
      for (const proj of indexer.iter()) {
        const chunkValue = this.getChunkValue(proj, indexer, value, selectionShape);
        queue.add(() => this.chunkSetItem(proj.chunkCoords, proj.chunkSelection, chunkValue));
      }
    }
    await queue.onIdle();
  }
  async chunkSetItem(chunkCoords, chunkSelection, value) {
    const chunkKey = this.chunkKey(chunkCoords);
    let chunk = null;
    const dtypeConstr = getTypedArrayCtr(this.dtype);
    const chunkSize = this.chunkSize;
    if (isTotalSlice(chunkSelection, this.chunks)) {
      if (typeof value === "number") {
        chunk = new dtypeConstr(chunkSize);
        chunk.fill(value);
      } else {
        chunk = value.flatten();
      }
    } else {
      let chunkData2;
      try {
        const chunkStoreData = await this.chunkStore.getItem(chunkKey);
        const dBytes = await this.decodeChunk(chunkStoreData);
        chunkData2 = this.toTypedArray(dBytes);
      } catch (error) {
        if (isKeyError(error)) {
          chunkData2 = new dtypeConstr(chunkSize);
          if (this.fillValue !== null) {
            chunkData2.fill(this.fillValue);
          }
        } else {
          throw error;
        }
      }
      const chunkNestedArray = new NestedArray(chunkData2, this.chunks, this.dtype);
      chunkNestedArray.set(chunkSelection, value);
      chunk = chunkNestedArray.flatten();
    }
    const chunkData = await this.encodeChunk(chunk);
    this.chunkStore.setItem(chunkKey, chunkData);
  }
  async encodeChunk(chunk) {
    if (this.dtype.includes(">")) {
      chunk = byteSwap(chunk);
    }
    if (this.compressor !== null) {
      const bytes = new Uint8Array(chunk.buffer);
      const cbytes = await (await this.compressor).encode(bytes);
      return cbytes.buffer;
    }
    return chunk.buffer;
  }
}
class MemoryStore {
  constructor(root = {}) {
    this.root = root;
  }
  proxy() {
    return createProxy(this);
  }
  getParent(item) {
    let parent = this.root;
    const segments = item.split("/");
    for (const k of segments.slice(0, segments.length - 1)) {
      parent = parent[k];
      if (!parent) {
        throw Error(item);
      }
    }
    return [parent, segments[segments.length - 1]];
  }
  requireParent(item) {
    let parent = this.root;
    const segments = item.split("/");
    for (const k of segments.slice(0, segments.length - 1)) {
      if (parent[k] === void 0) {
        parent[k] = {};
      }
      parent = parent[k];
    }
    return [parent, segments[segments.length - 1]];
  }
  getItem(item) {
    const [parent, key] = this.getParent(item);
    const value = parent[key];
    if (value === void 0) {
      throw new KeyError(item);
    }
    return value;
  }
  setItem(item, value) {
    const [parent, key] = this.requireParent(item);
    parent[key] = value;
    return true;
  }
  deleteItem(item) {
    const [parent, key] = this.getParent(item);
    return delete parent[key];
  }
  containsItem(item) {
    try {
      return this.getItem(item) !== void 0;
    } catch (e) {
      return false;
    }
  }
  keys() {
    throw new Error("Method not implemented.");
  }
}
var HTTPMethod;
(function(HTTPMethod2) {
  HTTPMethod2["HEAD"] = "HEAD";
  HTTPMethod2["GET"] = "GET";
  HTTPMethod2["PUT"] = "PUT";
})(HTTPMethod || (HTTPMethod = {}));
const DEFAULT_METHODS = [HTTPMethod.HEAD, HTTPMethod.GET, HTTPMethod.PUT];
class HTTPStore {
  constructor(url, options = {}) {
    this.url = url;
    const {fetchOptions = {}, supportedMethods = DEFAULT_METHODS} = options;
    this.fetchOptions = fetchOptions;
    this.supportedMethods = new Set(supportedMethods);
  }
  keys() {
    throw new Error("Method not implemented.");
  }
  async getItem(item, opts) {
    const url = joinUrlParts(this.url, item);
    const value = await fetch(url, {...this.fetchOptions, ...opts});
    if (value.status === 404) {
      throw new KeyError(item);
    } else if (value.status !== 200) {
      throw new HTTPError(String(value.status));
    }
    if (IS_NODE) {
      return Buffer.from(await value.arrayBuffer());
    } else {
      return value.arrayBuffer();
    }
  }
  async setItem(item, value) {
    if (!this.supportedMethods.has(HTTPMethod.PUT)) {
      throw new Error("HTTP PUT no a supported method for store.");
    }
    const url = joinUrlParts(this.url, item);
    if (typeof value === "string") {
      value = new TextEncoder().encode(value).buffer;
    }
    const set = await fetch(url, {...this.fetchOptions, method: HTTPMethod.PUT, body: value});
    return set.status.toString()[0] === "2";
  }
  deleteItem(_item) {
    throw new Error("Method not implemented.");
  }
  async containsItem(item) {
    const url = joinUrlParts(this.url, item);
    const method = this.supportedMethods.has(HTTPMethod.HEAD) ? HTTPMethod.HEAD : HTTPMethod.GET;
    const value = await fetch(url, {...this.fetchOptions, method});
    return value.status === 200;
  }
}
async function create({shape, chunks = true, dtype = "<i4", compressor = null, fillValue = null, order = "C", store, overwrite = false, path, chunkStore, filters, cacheMetadata = true, cacheAttrs = true, readOnly = false, dimensionSeparator}) {
  store = normalizeStoreArgument(store);
  await initArray(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters, dimensionSeparator);
  const z = await ZarrArray.create(store, path, readOnly, chunkStore, cacheMetadata, cacheAttrs);
  return z;
}
async function empty(shape, opts = {}) {
  opts.fillValue = null;
  return create({shape, ...opts});
}
async function zeros(shape, opts = {}) {
  opts.fillValue = 0;
  return create({shape, ...opts});
}
async function ones(shape, opts = {}) {
  opts.fillValue = 1;
  return create({shape, ...opts});
}
async function full(shape, fillValue, opts = {}) {
  opts.fillValue = fillValue;
  return create({shape, ...opts});
}
async function array(data, opts = {}) {
  let shape = null;
  if (data instanceof NestedArray) {
    shape = data.shape;
    opts.dtype = opts.dtype === void 0 ? data.dtype : opts.dtype;
  } else {
    shape = data.byteLength;
  }
  const wasReadOnly = opts.readOnly === void 0 ? false : opts.readOnly;
  opts.readOnly = false;
  const z = await create({shape, ...opts});
  await z.set(null, data);
  z.readOnly = wasReadOnly;
  return z;
}
async function openArray({shape, mode = "a", chunks = true, dtype = "<i4", compressor = null, fillValue = null, order = "C", store, overwrite = false, path = null, chunkStore, filters, cacheMetadata = true, cacheAttrs = true, dimensionSeparator} = {}) {
  store = normalizeStoreArgument(store);
  if (chunkStore === void 0) {
    chunkStore = normalizeStoreArgument(store);
  }
  path = normalizeStoragePath(path);
  if (mode === "r" || mode === "r+") {
    if (!await containsArray(store, path)) {
      if (await containsGroup(store, path)) {
        throw new ContainsGroupError(path);
      }
      throw new ArrayNotFoundError(path);
    }
  } else if (mode === "w") {
    if (shape === void 0) {
      throw new ValueError("Shape can not be undefined when creating a new array");
    }
    await initArray(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters, dimensionSeparator);
  } else if (mode === "a") {
    if (!await containsArray(store, path)) {
      if (await containsGroup(store, path)) {
        throw new ContainsGroupError(path);
      }
      if (shape === void 0) {
        throw new ValueError("Shape can not be undefined when creating a new array");
      }
      await initArray(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters, dimensionSeparator);
    }
  } else if (mode === "w-" || mode === "x") {
    if (await containsArray(store, path)) {
      throw new ContainsArrayError(path);
    } else if (await containsGroup(store, path)) {
      throw new ContainsGroupError(path);
    } else {
      if (shape === void 0) {
        throw new ValueError("Shape can not be undefined when creating a new array");
      }
      await initArray(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters, dimensionSeparator);
    }
  } else {
    throw new ValueError(`Invalid mode argument: ${mode}`);
  }
  const readOnly = mode === "r";
  return ZarrArray.create(store, path, readOnly, chunkStore, cacheMetadata, cacheAttrs);
}
function normalizeStoreArgument(store) {
  if (store === void 0) {
    return new MemoryStore();
  } else if (typeof store === "string") {
    return new HTTPStore(store);
  }
  return store;
}
class Group {
  constructor(store, path = null, metadata, readOnly = false, chunkStore = null, cacheAttrs = true) {
    this.store = store;
    this._chunkStore = chunkStore;
    this.path = normalizeStoragePath(path);
    this.keyPrefix = pathToPrefix(this.path);
    this.readOnly = readOnly;
    this.meta = metadata;
    const attrKey = this.keyPrefix + ATTRS_META_KEY;
    this.attrs = new Attributes(this.store, attrKey, this.readOnly, cacheAttrs);
  }
  get name() {
    if (this.path.length > 0) {
      if (this.path[0] !== "/") {
        return "/" + this.path;
      }
      return this.path;
    }
    return "/";
  }
  get basename() {
    const parts = this.name.split("/");
    return parts[parts.length - 1];
  }
  get chunkStore() {
    if (this._chunkStore) {
      return this._chunkStore;
    }
    return this.store;
  }
  static async create(store, path = null, readOnly = false, chunkStore = null, cacheAttrs = true) {
    const metadata = await this.loadMetadataForConstructor(store, path);
    return new Group(store, path, metadata, readOnly, chunkStore, cacheAttrs);
  }
  static async loadMetadataForConstructor(store, path) {
    path = normalizeStoragePath(path);
    const keyPrefix = pathToPrefix(path);
    try {
      const metaStoreValue = await store.getItem(keyPrefix + GROUP_META_KEY);
      return parseMetadata(metaStoreValue);
    } catch (error) {
      if (await containsArray(store, path)) {
        throw new ContainsArrayError(path);
      }
      throw new GroupNotFoundError(path);
    }
  }
  itemPath(item) {
    const absolute = typeof item === "string" && item.length > 0 && item[0] === "/";
    const path = normalizeStoragePath(item);
    if (!absolute && this.path.length > 0) {
      return this.keyPrefix + path;
    }
    return path;
  }
  async createGroup(name, overwrite = false) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    const path = this.itemPath(name);
    await initGroup(this.store, path, this._chunkStore, overwrite);
    return Group.create(this.store, path, this.readOnly, this._chunkStore, this.attrs.cache);
  }
  async requireGroup(name, overwrite = false) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    const path = this.itemPath(name);
    if (!await containsGroup(this.store, path)) {
      await initGroup(this.store, path, this._chunkStore, overwrite);
    }
    return Group.create(this.store, path, this.readOnly, this._chunkStore, this.attrs.cache);
  }
  getOptsForArrayCreation(name, opts = {}) {
    const path = this.itemPath(name);
    opts.path = path;
    if (opts.cacheAttrs === void 0) {
      opts.cacheAttrs = this.attrs.cache;
    }
    opts.store = this.store;
    opts.chunkStore = this.chunkStore;
    return opts;
  }
  array(name, data, opts, overwrite) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    opts = this.getOptsForArrayCreation(name, opts);
    opts.overwrite = overwrite === void 0 ? opts.overwrite : overwrite;
    return array(data, opts);
  }
  empty(name, shape, opts = {}) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    opts = this.getOptsForArrayCreation(name, opts);
    return empty(shape, opts);
  }
  zeros(name, shape, opts = {}) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    opts = this.getOptsForArrayCreation(name, opts);
    return zeros(shape, opts);
  }
  ones(name, shape, opts = {}) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    opts = this.getOptsForArrayCreation(name, opts);
    return ones(shape, opts);
  }
  full(name, shape, fillValue, opts = {}) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    opts = this.getOptsForArrayCreation(name, opts);
    return full(shape, fillValue, opts);
  }
  createDataset(name, shape, data, opts) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    opts = this.getOptsForArrayCreation(name, opts);
    let z;
    if (data === void 0) {
      if (shape === void 0) {
        throw new ValueError("Shape must be set if no data is passed to CreateDataset");
      }
      z = create({shape, ...opts});
    } else {
      z = array(data, opts);
    }
    return z;
  }
  async getItem(item) {
    const path = this.itemPath(item);
    if (await containsArray(this.store, path)) {
      return ZarrArray.create(this.store, path, this.readOnly, this.chunkStore, void 0, this.attrs.cache);
    } else if (await containsGroup(this.store, path)) {
      return Group.create(this.store, path, this.readOnly, this._chunkStore, this.attrs.cache);
    }
    throw new KeyError(item);
  }
  async setItem(item, value) {
    await this.array(item, value, {}, true);
    return true;
  }
  async deleteItem(_item) {
    if (this.readOnly) {
      throw new PermissionError("group is read only");
    }
    throw new Error("Method not implemented.");
  }
  async containsItem(item) {
    const path = this.itemPath(item);
    return await containsArray(this.store, path) || containsGroup(this.store, path);
  }
  proxy() {
    return createProxy(this);
  }
}
async function openGroup(store, path = null, mode = "a", chunkStore, cacheAttrs = true) {
  store = normalizeStoreArgument(store);
  if (chunkStore !== void 0) {
    chunkStore = normalizeStoreArgument(store);
  }
  path = normalizeStoragePath(path);
  if (mode === "r" || mode === "r+") {
    if (!await containsGroup(store, path)) {
      if (await containsArray(store, path)) {
        throw new ContainsArrayError(path);
      }
      throw new GroupNotFoundError(path);
    }
  } else if (mode === "w") {
    await initGroup(store, path, chunkStore, true);
  } else if (mode === "a") {
    if (!await containsGroup(store, path)) {
      if (await containsArray(store, path)) {
        throw new ContainsArrayError(path);
      }
      await initGroup(store, path, chunkStore);
    }
  } else if (mode === "w-" || mode === "x") {
    if (await containsArray(store, path)) {
      throw new ContainsArrayError(path);
    } else if (await containsGroup(store, path)) {
      throw new ContainsGroupError(path);
    } else {
      await initGroup(store, path, chunkStore);
    }
  } else {
    throw new ValueError(`Invalid mode argument: ${mode}`);
  }
  const readOnly = mode === "r";
  return Group.create(store, path, readOnly, chunkStore, cacheAttrs);
}

/*! pako 2.0.2 https://github.com/nodeca/pako @license (MIT AND Zlib) */
const Z_FIXED = 4;
const Z_BINARY = 0;
const Z_TEXT = 1;
const Z_UNKNOWN = 2;
function zero(buf) {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
}
const STORED_BLOCK = 0;
const STATIC_TREES = 1;
const DYN_TREES = 2;
const MIN_MATCH = 3;
const MAX_MATCH = 258;
const LENGTH_CODES = 29;
const LITERALS = 256;
const L_CODES = LITERALS + 1 + LENGTH_CODES;
const D_CODES = 30;
const BL_CODES = 19;
const HEAP_SIZE = 2 * L_CODES + 1;
const MAX_BITS = 15;
const Buf_size = 16;
const MAX_BL_BITS = 7;
const END_BLOCK = 256;
const REP_3_6 = 16;
const REPZ_3_10 = 17;
const REPZ_11_138 = 18;
const extra_lbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]);
const extra_dbits = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
const extra_blbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]);
const bl_order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
const DIST_CODE_LEN = 512;
const static_ltree = new Array((L_CODES + 2) * 2);
zero(static_ltree);
const static_dtree = new Array(D_CODES * 2);
zero(static_dtree);
const _dist_code = new Array(DIST_CODE_LEN);
zero(_dist_code);
const _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
const base_length = new Array(LENGTH_CODES);
zero(base_length);
const base_dist = new Array(D_CODES);
zero(base_dist);
function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
  this.static_tree = static_tree;
  this.extra_bits = extra_bits;
  this.extra_base = extra_base;
  this.elems = elems;
  this.max_length = max_length;
  this.has_stree = static_tree && static_tree.length;
}
let static_l_desc;
let static_d_desc;
let static_bl_desc;
function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;
  this.max_code = 0;
  this.stat_desc = stat_desc;
}
const d_code = (dist) => {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};
const put_short = (s2, w2) => {
  s2.pending_buf[s2.pending++] = w2 & 255;
  s2.pending_buf[s2.pending++] = w2 >>> 8 & 255;
};
const send_bits = (s2, value, length) => {
  if (s2.bi_valid > Buf_size - length) {
    s2.bi_buf |= value << s2.bi_valid & 65535;
    put_short(s2, s2.bi_buf);
    s2.bi_buf = value >> Buf_size - s2.bi_valid;
    s2.bi_valid += length - Buf_size;
  } else {
    s2.bi_buf |= value << s2.bi_valid & 65535;
    s2.bi_valid += length;
  }
};
const send_code = (s2, c2, tree) => {
  send_bits(s2, tree[c2 * 2], tree[c2 * 2 + 1]);
};
const bi_reverse = (code, len) => {
  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};
const bi_flush = (s2) => {
  if (s2.bi_valid === 16) {
    put_short(s2, s2.bi_buf);
    s2.bi_buf = 0;
    s2.bi_valid = 0;
  } else if (s2.bi_valid >= 8) {
    s2.pending_buf[s2.pending++] = s2.bi_buf & 255;
    s2.bi_buf >>= 8;
    s2.bi_valid -= 8;
  }
};
const gen_bitlen = (s2, desc) => {
  const tree = desc.dyn_tree;
  const max_code = desc.max_code;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const extra = desc.stat_desc.extra_bits;
  const base = desc.stat_desc.extra_base;
  const max_length = desc.stat_desc.max_length;
  let h2;
  let n2, m2;
  let bits;
  let xbits;
  let f2;
  let overflow = 0;
  for (bits = 0; bits <= MAX_BITS; bits++) {
    s2.bl_count[bits] = 0;
  }
  tree[s2.heap[s2.heap_max] * 2 + 1] = 0;
  for (h2 = s2.heap_max + 1; h2 < HEAP_SIZE; h2++) {
    n2 = s2.heap[h2];
    bits = tree[tree[n2 * 2 + 1] * 2 + 1] + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n2 * 2 + 1] = bits;
    if (n2 > max_code) {
      continue;
    }
    s2.bl_count[bits]++;
    xbits = 0;
    if (n2 >= base) {
      xbits = extra[n2 - base];
    }
    f2 = tree[n2 * 2];
    s2.opt_len += f2 * (bits + xbits);
    if (has_stree) {
      s2.static_len += f2 * (stree[n2 * 2 + 1] + xbits);
    }
  }
  if (overflow === 0) {
    return;
  }
  do {
    bits = max_length - 1;
    while (s2.bl_count[bits] === 0) {
      bits--;
    }
    s2.bl_count[bits]--;
    s2.bl_count[bits + 1] += 2;
    s2.bl_count[max_length]--;
    overflow -= 2;
  } while (overflow > 0);
  for (bits = max_length; bits !== 0; bits--) {
    n2 = s2.bl_count[bits];
    while (n2 !== 0) {
      m2 = s2.heap[--h2];
      if (m2 > max_code) {
        continue;
      }
      if (tree[m2 * 2 + 1] !== bits) {
        s2.opt_len += (bits - tree[m2 * 2 + 1]) * tree[m2 * 2];
        tree[m2 * 2 + 1] = bits;
      }
      n2--;
    }
  }
};
const gen_codes = (tree, max_code, bl_count) => {
  const next_code = new Array(MAX_BITS + 1);
  let code = 0;
  let bits;
  let n2;
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = code + bl_count[bits - 1] << 1;
  }
  for (n2 = 0; n2 <= max_code; n2++) {
    let len = tree[n2 * 2 + 1];
    if (len === 0) {
      continue;
    }
    tree[n2 * 2] = bi_reverse(next_code[len]++, len);
  }
};
const tr_static_init = () => {
  let n2;
  let bits;
  let length;
  let code;
  let dist;
  const bl_count = new Array(MAX_BITS + 1);
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n2 = 0; n2 < 1 << extra_lbits[code]; n2++) {
      _length_code[length++] = code;
    }
  }
  _length_code[length - 1] = code;
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n2 = 0; n2 < 1 << extra_dbits[code]; n2++) {
      _dist_code[dist++] = code;
    }
  }
  dist >>= 7;
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n2 = 0; n2 < 1 << extra_dbits[code] - 7; n2++) {
      _dist_code[256 + dist++] = code;
    }
  }
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }
  n2 = 0;
  while (n2 <= 143) {
    static_ltree[n2 * 2 + 1] = 8;
    n2++;
    bl_count[8]++;
  }
  while (n2 <= 255) {
    static_ltree[n2 * 2 + 1] = 9;
    n2++;
    bl_count[9]++;
  }
  while (n2 <= 279) {
    static_ltree[n2 * 2 + 1] = 7;
    n2++;
    bl_count[7]++;
  }
  while (n2 <= 287) {
    static_ltree[n2 * 2 + 1] = 8;
    n2++;
    bl_count[8]++;
  }
  gen_codes(static_ltree, L_CODES + 1, bl_count);
  for (n2 = 0; n2 < D_CODES; n2++) {
    static_dtree[n2 * 2 + 1] = 5;
    static_dtree[n2 * 2] = bi_reverse(n2, 5);
  }
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
};
const init_block = (s2) => {
  let n2;
  for (n2 = 0; n2 < L_CODES; n2++) {
    s2.dyn_ltree[n2 * 2] = 0;
  }
  for (n2 = 0; n2 < D_CODES; n2++) {
    s2.dyn_dtree[n2 * 2] = 0;
  }
  for (n2 = 0; n2 < BL_CODES; n2++) {
    s2.bl_tree[n2 * 2] = 0;
  }
  s2.dyn_ltree[END_BLOCK * 2] = 1;
  s2.opt_len = s2.static_len = 0;
  s2.last_lit = s2.matches = 0;
};
const bi_windup = (s2) => {
  if (s2.bi_valid > 8) {
    put_short(s2, s2.bi_buf);
  } else if (s2.bi_valid > 0) {
    s2.pending_buf[s2.pending++] = s2.bi_buf;
  }
  s2.bi_buf = 0;
  s2.bi_valid = 0;
};
const copy_block = (s2, buf, len, header) => {
  bi_windup(s2);
  if (header) {
    put_short(s2, len);
    put_short(s2, ~len);
  }
  s2.pending_buf.set(s2.window.subarray(buf, buf + len), s2.pending);
  s2.pending += len;
};
const smaller = (tree, n2, m2, depth) => {
  const _n2 = n2 * 2;
  const _m2 = m2 * 2;
  return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n2] <= depth[m2];
};
const pqdownheap = (s2, tree, k2) => {
  const v2 = s2.heap[k2];
  let j2 = k2 << 1;
  while (j2 <= s2.heap_len) {
    if (j2 < s2.heap_len && smaller(tree, s2.heap[j2 + 1], s2.heap[j2], s2.depth)) {
      j2++;
    }
    if (smaller(tree, v2, s2.heap[j2], s2.depth)) {
      break;
    }
    s2.heap[k2] = s2.heap[j2];
    k2 = j2;
    j2 <<= 1;
  }
  s2.heap[k2] = v2;
};
const compress_block = (s2, ltree, dtree) => {
  let dist;
  let lc;
  let lx = 0;
  let code;
  let extra;
  if (s2.last_lit !== 0) {
    do {
      dist = s2.pending_buf[s2.d_buf + lx * 2] << 8 | s2.pending_buf[s2.d_buf + lx * 2 + 1];
      lc = s2.pending_buf[s2.l_buf + lx];
      lx++;
      if (dist === 0) {
        send_code(s2, lc, ltree);
      } else {
        code = _length_code[lc];
        send_code(s2, code + LITERALS + 1, ltree);
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s2, lc, extra);
        }
        dist--;
        code = d_code(dist);
        send_code(s2, code, dtree);
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s2, dist, extra);
        }
      }
    } while (lx < s2.last_lit);
  }
  send_code(s2, END_BLOCK, ltree);
};
const build_tree = (s2, desc) => {
  const tree = desc.dyn_tree;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems = desc.stat_desc.elems;
  let n2, m2;
  let max_code = -1;
  let node;
  s2.heap_len = 0;
  s2.heap_max = HEAP_SIZE;
  for (n2 = 0; n2 < elems; n2++) {
    if (tree[n2 * 2] !== 0) {
      s2.heap[++s2.heap_len] = max_code = n2;
      s2.depth[n2] = 0;
    } else {
      tree[n2 * 2 + 1] = 0;
    }
  }
  while (s2.heap_len < 2) {
    node = s2.heap[++s2.heap_len] = max_code < 2 ? ++max_code : 0;
    tree[node * 2] = 1;
    s2.depth[node] = 0;
    s2.opt_len--;
    if (has_stree) {
      s2.static_len -= stree[node * 2 + 1];
    }
  }
  desc.max_code = max_code;
  for (n2 = s2.heap_len >> 1; n2 >= 1; n2--) {
    pqdownheap(s2, tree, n2);
  }
  node = elems;
  do {
    n2 = s2.heap[1];
    s2.heap[1] = s2.heap[s2.heap_len--];
    pqdownheap(s2, tree, 1);
    m2 = s2.heap[1];
    s2.heap[--s2.heap_max] = n2;
    s2.heap[--s2.heap_max] = m2;
    tree[node * 2] = tree[n2 * 2] + tree[m2 * 2];
    s2.depth[node] = (s2.depth[n2] >= s2.depth[m2] ? s2.depth[n2] : s2.depth[m2]) + 1;
    tree[n2 * 2 + 1] = tree[m2 * 2 + 1] = node;
    s2.heap[1] = node++;
    pqdownheap(s2, tree, 1);
  } while (s2.heap_len >= 2);
  s2.heap[--s2.heap_max] = s2.heap[1];
  gen_bitlen(s2, desc);
  gen_codes(tree, max_code, s2.bl_count);
};
const scan_tree = (s2, tree, max_code) => {
  let n2;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1] = 65535;
  for (n2 = 0; n2 <= max_code; n2++) {
    curlen = nextlen;
    nextlen = tree[(n2 + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      s2.bl_tree[curlen * 2] += count;
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        s2.bl_tree[curlen * 2]++;
      }
      s2.bl_tree[REP_3_6 * 2]++;
    } else if (count <= 10) {
      s2.bl_tree[REPZ_3_10 * 2]++;
    } else {
      s2.bl_tree[REPZ_11_138 * 2]++;
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
const send_tree = (s2, tree, max_code) => {
  let n2;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  for (n2 = 0; n2 <= max_code; n2++) {
    curlen = nextlen;
    nextlen = tree[(n2 + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      do {
        send_code(s2, curlen, s2.bl_tree);
      } while (--count !== 0);
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s2, curlen, s2.bl_tree);
        count--;
      }
      send_code(s2, REP_3_6, s2.bl_tree);
      send_bits(s2, count - 3, 2);
    } else if (count <= 10) {
      send_code(s2, REPZ_3_10, s2.bl_tree);
      send_bits(s2, count - 3, 3);
    } else {
      send_code(s2, REPZ_11_138, s2.bl_tree);
      send_bits(s2, count - 11, 7);
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
const build_bl_tree = (s2) => {
  let max_blindex;
  scan_tree(s2, s2.dyn_ltree, s2.l_desc.max_code);
  scan_tree(s2, s2.dyn_dtree, s2.d_desc.max_code);
  build_tree(s2, s2.bl_desc);
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s2.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
      break;
    }
  }
  s2.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  return max_blindex;
};
const send_all_trees = (s2, lcodes, dcodes, blcodes) => {
  let rank2;
  send_bits(s2, lcodes - 257, 5);
  send_bits(s2, dcodes - 1, 5);
  send_bits(s2, blcodes - 4, 4);
  for (rank2 = 0; rank2 < blcodes; rank2++) {
    send_bits(s2, s2.bl_tree[bl_order[rank2] * 2 + 1], 3);
  }
  send_tree(s2, s2.dyn_ltree, lcodes - 1);
  send_tree(s2, s2.dyn_dtree, dcodes - 1);
};
const detect_data_type = (s2) => {
  let black_mask = 4093624447;
  let n2;
  for (n2 = 0; n2 <= 31; n2++, black_mask >>>= 1) {
    if (black_mask & 1 && s2.dyn_ltree[n2 * 2] !== 0) {
      return Z_BINARY;
    }
  }
  if (s2.dyn_ltree[9 * 2] !== 0 || s2.dyn_ltree[10 * 2] !== 0 || s2.dyn_ltree[13 * 2] !== 0) {
    return Z_TEXT;
  }
  for (n2 = 32; n2 < LITERALS; n2++) {
    if (s2.dyn_ltree[n2 * 2] !== 0) {
      return Z_TEXT;
    }
  }
  return Z_BINARY;
};
let static_init_done = false;
const _tr_init = (s2) => {
  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }
  s2.l_desc = new TreeDesc(s2.dyn_ltree, static_l_desc);
  s2.d_desc = new TreeDesc(s2.dyn_dtree, static_d_desc);
  s2.bl_desc = new TreeDesc(s2.bl_tree, static_bl_desc);
  s2.bi_buf = 0;
  s2.bi_valid = 0;
  init_block(s2);
};
const _tr_stored_block = (s2, buf, stored_len, last) => {
  send_bits(s2, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
  copy_block(s2, buf, stored_len, true);
};
const _tr_align = (s2) => {
  send_bits(s2, STATIC_TREES << 1, 3);
  send_code(s2, END_BLOCK, static_ltree);
  bi_flush(s2);
};
const _tr_flush_block = (s2, buf, stored_len, last) => {
  let opt_lenb, static_lenb;
  let max_blindex = 0;
  if (s2.level > 0) {
    if (s2.strm.data_type === Z_UNKNOWN) {
      s2.strm.data_type = detect_data_type(s2);
    }
    build_tree(s2, s2.l_desc);
    build_tree(s2, s2.d_desc);
    max_blindex = build_bl_tree(s2);
    opt_lenb = s2.opt_len + 3 + 7 >>> 3;
    static_lenb = s2.static_len + 3 + 7 >>> 3;
    if (static_lenb <= opt_lenb) {
      opt_lenb = static_lenb;
    }
  } else {
    opt_lenb = static_lenb = stored_len + 5;
  }
  if (stored_len + 4 <= opt_lenb && buf !== -1) {
    _tr_stored_block(s2, buf, stored_len, last);
  } else if (s2.strategy === Z_FIXED || static_lenb === opt_lenb) {
    send_bits(s2, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s2, static_ltree, static_dtree);
  } else {
    send_bits(s2, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s2, s2.l_desc.max_code + 1, s2.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s2, s2.dyn_ltree, s2.dyn_dtree);
  }
  init_block(s2);
  if (last) {
    bi_windup(s2);
  }
};
const _tr_tally = (s2, dist, lc) => {
  s2.pending_buf[s2.d_buf + s2.last_lit * 2] = dist >>> 8 & 255;
  s2.pending_buf[s2.d_buf + s2.last_lit * 2 + 1] = dist & 255;
  s2.pending_buf[s2.l_buf + s2.last_lit] = lc & 255;
  s2.last_lit++;
  if (dist === 0) {
    s2.dyn_ltree[lc * 2]++;
  } else {
    s2.matches++;
    dist--;
    s2.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
    s2.dyn_dtree[d_code(dist) * 2]++;
  }
  return s2.last_lit === s2.lit_bufsize - 1;
};
var _tr_init_1 = _tr_init;
var _tr_stored_block_1 = _tr_stored_block;
var _tr_flush_block_1 = _tr_flush_block;
var _tr_tally_1 = _tr_tally;
var _tr_align_1 = _tr_align;
var trees = {
  _tr_init: _tr_init_1,
  _tr_stored_block: _tr_stored_block_1,
  _tr_flush_block: _tr_flush_block_1,
  _tr_tally: _tr_tally_1,
  _tr_align: _tr_align_1
};
const adler32 = (adler, buf, len, pos) => {
  let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n2 = 0;
  while (len !== 0) {
    n2 = len > 2e3 ? 2e3 : len;
    len -= n2;
    do {
      s1 = s1 + buf[pos++] | 0;
      s2 = s2 + s1 | 0;
    } while (--n2);
    s1 %= 65521;
    s2 %= 65521;
  }
  return s1 | s2 << 16 | 0;
};
var adler32_1 = adler32;
const makeTable = () => {
  let c2, table = [];
  for (var n2 = 0; n2 < 256; n2++) {
    c2 = n2;
    for (var k2 = 0; k2 < 8; k2++) {
      c2 = c2 & 1 ? 3988292384 ^ c2 >>> 1 : c2 >>> 1;
    }
    table[n2] = c2;
  }
  return table;
};
const crcTable = new Uint32Array(makeTable());
const crc32 = (crc, buf, len, pos) => {
  const t2 = crcTable;
  const end = pos + len;
  crc ^= -1;
  for (let i2 = pos; i2 < end; i2++) {
    crc = crc >>> 8 ^ t2[(crc ^ buf[i2]) & 255];
  }
  return crc ^ -1;
};
var crc32_1 = crc32;
var messages = {
  2: "need dictionary",
  1: "stream end",
  0: "",
  "-1": "file error",
  "-2": "stream error",
  "-3": "data error",
  "-4": "insufficient memory",
  "-5": "buffer error",
  "-6": "incompatible version"
};
var constants = {
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  Z_MEM_ERROR: -4,
  Z_BUF_ERROR: -5,
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  Z_BINARY: 0,
  Z_TEXT: 1,
  Z_UNKNOWN: 2,
  Z_DEFLATED: 8
};
const {_tr_init: _tr_init$1, _tr_stored_block: _tr_stored_block$1, _tr_flush_block: _tr_flush_block$1, _tr_tally: _tr_tally$1, _tr_align: _tr_align$1} = trees;
const {
  Z_NO_FLUSH,
  Z_PARTIAL_FLUSH,
  Z_FULL_FLUSH,
  Z_FINISH,
  Z_BLOCK,
  Z_OK,
  Z_STREAM_END,
  Z_STREAM_ERROR,
  Z_DATA_ERROR,
  Z_BUF_ERROR,
  Z_DEFAULT_COMPRESSION,
  Z_FILTERED,
  Z_HUFFMAN_ONLY,
  Z_RLE,
  Z_FIXED: Z_FIXED$1,
  Z_DEFAULT_STRATEGY,
  Z_UNKNOWN: Z_UNKNOWN$1,
  Z_DEFLATED
} = constants;
const MAX_MEM_LEVEL = 9;
const MAX_WBITS = 15;
const DEF_MEM_LEVEL = 8;
const LENGTH_CODES$1 = 29;
const LITERALS$1 = 256;
const L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
const D_CODES$1 = 30;
const BL_CODES$1 = 19;
const HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
const MAX_BITS$1 = 15;
const MIN_MATCH$1 = 3;
const MAX_MATCH$1 = 258;
const MIN_LOOKAHEAD = MAX_MATCH$1 + MIN_MATCH$1 + 1;
const PRESET_DICT = 32;
const INIT_STATE = 42;
const EXTRA_STATE = 69;
const NAME_STATE = 73;
const COMMENT_STATE = 91;
const HCRC_STATE = 103;
const BUSY_STATE = 113;
const FINISH_STATE = 666;
const BS_NEED_MORE = 1;
const BS_BLOCK_DONE = 2;
const BS_FINISH_STARTED = 3;
const BS_FINISH_DONE = 4;
const OS_CODE = 3;
const err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};
const rank = (f2) => {
  return (f2 << 1) - (f2 > 4 ? 9 : 0);
};
const zero$1 = (buf) => {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
};
let HASH_ZLIB = (s2, prev, data) => (prev << s2.hash_shift ^ data) & s2.hash_mask;
let HASH = HASH_ZLIB;
const flush_pending = (strm) => {
  const s2 = strm.state;
  let len = s2.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) {
    return;
  }
  strm.output.set(s2.pending_buf.subarray(s2.pending_out, s2.pending_out + len), strm.next_out);
  strm.next_out += len;
  s2.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s2.pending -= len;
  if (s2.pending === 0) {
    s2.pending_out = 0;
  }
};
const flush_block_only = (s2, last) => {
  _tr_flush_block$1(s2, s2.block_start >= 0 ? s2.block_start : -1, s2.strstart - s2.block_start, last);
  s2.block_start = s2.strstart;
  flush_pending(s2.strm);
};
const put_byte = (s2, b2) => {
  s2.pending_buf[s2.pending++] = b2;
};
const putShortMSB = (s2, b2) => {
  s2.pending_buf[s2.pending++] = b2 >>> 8 & 255;
  s2.pending_buf[s2.pending++] = b2 & 255;
};
const read_buf = (strm, buf, start, size) => {
  let len = strm.avail_in;
  if (len > size) {
    len = size;
  }
  if (len === 0) {
    return 0;
  }
  strm.avail_in -= len;
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  } else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }
  strm.next_in += len;
  strm.total_in += len;
  return len;
};
const longest_match = (s2, cur_match) => {
  let chain_length = s2.max_chain_length;
  let scan = s2.strstart;
  let match;
  let len;
  let best_len = s2.prev_length;
  let nice_match = s2.nice_match;
  const limit = s2.strstart > s2.w_size - MIN_LOOKAHEAD ? s2.strstart - (s2.w_size - MIN_LOOKAHEAD) : 0;
  const _win = s2.window;
  const wmask = s2.w_mask;
  const prev = s2.prev;
  const strend = s2.strstart + MAX_MATCH$1;
  let scan_end1 = _win[scan + best_len - 1];
  let scan_end = _win[scan + best_len];
  if (s2.prev_length >= s2.good_match) {
    chain_length >>= 2;
  }
  if (nice_match > s2.lookahead) {
    nice_match = s2.lookahead;
  }
  do {
    match = cur_match;
    if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
      continue;
    }
    scan += 2;
    match++;
    do {
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
    len = MAX_MATCH$1 - (strend - scan);
    scan = strend - MAX_MATCH$1;
    if (len > best_len) {
      s2.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1 = _win[scan + best_len - 1];
      scan_end = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
  if (best_len <= s2.lookahead) {
    return best_len;
  }
  return s2.lookahead;
};
const fill_window = (s2) => {
  const _w_size = s2.w_size;
  let p2, n2, m2, more, str;
  do {
    more = s2.window_size - s2.lookahead - s2.strstart;
    if (s2.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
      s2.window.set(s2.window.subarray(_w_size, _w_size + _w_size), 0);
      s2.match_start -= _w_size;
      s2.strstart -= _w_size;
      s2.block_start -= _w_size;
      n2 = s2.hash_size;
      p2 = n2;
      do {
        m2 = s2.head[--p2];
        s2.head[p2] = m2 >= _w_size ? m2 - _w_size : 0;
      } while (--n2);
      n2 = _w_size;
      p2 = n2;
      do {
        m2 = s2.prev[--p2];
        s2.prev[p2] = m2 >= _w_size ? m2 - _w_size : 0;
      } while (--n2);
      more += _w_size;
    }
    if (s2.strm.avail_in === 0) {
      break;
    }
    n2 = read_buf(s2.strm, s2.window, s2.strstart + s2.lookahead, more);
    s2.lookahead += n2;
    if (s2.lookahead + s2.insert >= MIN_MATCH$1) {
      str = s2.strstart - s2.insert;
      s2.ins_h = s2.window[str];
      s2.ins_h = HASH(s2, s2.ins_h, s2.window[str + 1]);
      while (s2.insert) {
        s2.ins_h = HASH(s2, s2.ins_h, s2.window[str + MIN_MATCH$1 - 1]);
        s2.prev[str & s2.w_mask] = s2.head[s2.ins_h];
        s2.head[s2.ins_h] = str;
        str++;
        s2.insert--;
        if (s2.lookahead + s2.insert < MIN_MATCH$1) {
          break;
        }
      }
    }
  } while (s2.lookahead < MIN_LOOKAHEAD && s2.strm.avail_in !== 0);
};
const deflate_stored = (s2, flush) => {
  let max_block_size = 65535;
  if (max_block_size > s2.pending_buf_size - 5) {
    max_block_size = s2.pending_buf_size - 5;
  }
  for (; ; ) {
    if (s2.lookahead <= 1) {
      fill_window(s2);
      if (s2.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s2.lookahead === 0) {
        break;
      }
    }
    s2.strstart += s2.lookahead;
    s2.lookahead = 0;
    const max_start = s2.block_start + max_block_size;
    if (s2.strstart === 0 || s2.strstart >= max_start) {
      s2.lookahead = s2.strstart - max_start;
      s2.strstart = max_start;
      flush_block_only(s2, false);
      if (s2.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    if (s2.strstart - s2.block_start >= s2.w_size - MIN_LOOKAHEAD) {
      flush_block_only(s2, false);
      if (s2.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s2.insert = 0;
  if (flush === Z_FINISH) {
    flush_block_only(s2, true);
    if (s2.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s2.strstart > s2.block_start) {
    flush_block_only(s2, false);
    if (s2.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_NEED_MORE;
};
const deflate_fast = (s2, flush) => {
  let hash_head;
  let bflush;
  for (; ; ) {
    if (s2.lookahead < MIN_LOOKAHEAD) {
      fill_window(s2);
      if (s2.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s2.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s2.lookahead >= MIN_MATCH$1) {
      s2.ins_h = HASH(s2, s2.ins_h, s2.window[s2.strstart + MIN_MATCH$1 - 1]);
      hash_head = s2.prev[s2.strstart & s2.w_mask] = s2.head[s2.ins_h];
      s2.head[s2.ins_h] = s2.strstart;
    }
    if (hash_head !== 0 && s2.strstart - hash_head <= s2.w_size - MIN_LOOKAHEAD) {
      s2.match_length = longest_match(s2, hash_head);
    }
    if (s2.match_length >= MIN_MATCH$1) {
      bflush = _tr_tally$1(s2, s2.strstart - s2.match_start, s2.match_length - MIN_MATCH$1);
      s2.lookahead -= s2.match_length;
      if (s2.match_length <= s2.max_lazy_match && s2.lookahead >= MIN_MATCH$1) {
        s2.match_length--;
        do {
          s2.strstart++;
          s2.ins_h = HASH(s2, s2.ins_h, s2.window[s2.strstart + MIN_MATCH$1 - 1]);
          hash_head = s2.prev[s2.strstart & s2.w_mask] = s2.head[s2.ins_h];
          s2.head[s2.ins_h] = s2.strstart;
        } while (--s2.match_length !== 0);
        s2.strstart++;
      } else {
        s2.strstart += s2.match_length;
        s2.match_length = 0;
        s2.ins_h = s2.window[s2.strstart];
        s2.ins_h = HASH(s2, s2.ins_h, s2.window[s2.strstart + 1]);
      }
    } else {
      bflush = _tr_tally$1(s2, 0, s2.window[s2.strstart]);
      s2.lookahead--;
      s2.strstart++;
    }
    if (bflush) {
      flush_block_only(s2, false);
      if (s2.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s2.insert = s2.strstart < MIN_MATCH$1 - 1 ? s2.strstart : MIN_MATCH$1 - 1;
  if (flush === Z_FINISH) {
    flush_block_only(s2, true);
    if (s2.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s2.last_lit) {
    flush_block_only(s2, false);
    if (s2.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
const deflate_slow = (s2, flush) => {
  let hash_head;
  let bflush;
  let max_insert;
  for (; ; ) {
    if (s2.lookahead < MIN_LOOKAHEAD) {
      fill_window(s2);
      if (s2.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s2.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s2.lookahead >= MIN_MATCH$1) {
      s2.ins_h = HASH(s2, s2.ins_h, s2.window[s2.strstart + MIN_MATCH$1 - 1]);
      hash_head = s2.prev[s2.strstart & s2.w_mask] = s2.head[s2.ins_h];
      s2.head[s2.ins_h] = s2.strstart;
    }
    s2.prev_length = s2.match_length;
    s2.prev_match = s2.match_start;
    s2.match_length = MIN_MATCH$1 - 1;
    if (hash_head !== 0 && s2.prev_length < s2.max_lazy_match && s2.strstart - hash_head <= s2.w_size - MIN_LOOKAHEAD) {
      s2.match_length = longest_match(s2, hash_head);
      if (s2.match_length <= 5 && (s2.strategy === Z_FILTERED || s2.match_length === MIN_MATCH$1 && s2.strstart - s2.match_start > 4096)) {
        s2.match_length = MIN_MATCH$1 - 1;
      }
    }
    if (s2.prev_length >= MIN_MATCH$1 && s2.match_length <= s2.prev_length) {
      max_insert = s2.strstart + s2.lookahead - MIN_MATCH$1;
      bflush = _tr_tally$1(s2, s2.strstart - 1 - s2.prev_match, s2.prev_length - MIN_MATCH$1);
      s2.lookahead -= s2.prev_length - 1;
      s2.prev_length -= 2;
      do {
        if (++s2.strstart <= max_insert) {
          s2.ins_h = HASH(s2, s2.ins_h, s2.window[s2.strstart + MIN_MATCH$1 - 1]);
          hash_head = s2.prev[s2.strstart & s2.w_mask] = s2.head[s2.ins_h];
          s2.head[s2.ins_h] = s2.strstart;
        }
      } while (--s2.prev_length !== 0);
      s2.match_available = 0;
      s2.match_length = MIN_MATCH$1 - 1;
      s2.strstart++;
      if (bflush) {
        flush_block_only(s2, false);
        if (s2.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    } else if (s2.match_available) {
      bflush = _tr_tally$1(s2, 0, s2.window[s2.strstart - 1]);
      if (bflush) {
        flush_block_only(s2, false);
      }
      s2.strstart++;
      s2.lookahead--;
      if (s2.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      s2.match_available = 1;
      s2.strstart++;
      s2.lookahead--;
    }
  }
  if (s2.match_available) {
    bflush = _tr_tally$1(s2, 0, s2.window[s2.strstart - 1]);
    s2.match_available = 0;
  }
  s2.insert = s2.strstart < MIN_MATCH$1 - 1 ? s2.strstart : MIN_MATCH$1 - 1;
  if (flush === Z_FINISH) {
    flush_block_only(s2, true);
    if (s2.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s2.last_lit) {
    flush_block_only(s2, false);
    if (s2.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
const deflate_rle = (s2, flush) => {
  let bflush;
  let prev;
  let scan, strend;
  const _win = s2.window;
  for (; ; ) {
    if (s2.lookahead <= MAX_MATCH$1) {
      fill_window(s2);
      if (s2.lookahead <= MAX_MATCH$1 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s2.lookahead === 0) {
        break;
      }
    }
    s2.match_length = 0;
    if (s2.lookahead >= MIN_MATCH$1 && s2.strstart > 0) {
      scan = s2.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s2.strstart + MAX_MATCH$1;
        do {
        } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
        s2.match_length = MAX_MATCH$1 - (strend - scan);
        if (s2.match_length > s2.lookahead) {
          s2.match_length = s2.lookahead;
        }
      }
    }
    if (s2.match_length >= MIN_MATCH$1) {
      bflush = _tr_tally$1(s2, 1, s2.match_length - MIN_MATCH$1);
      s2.lookahead -= s2.match_length;
      s2.strstart += s2.match_length;
      s2.match_length = 0;
    } else {
      bflush = _tr_tally$1(s2, 0, s2.window[s2.strstart]);
      s2.lookahead--;
      s2.strstart++;
    }
    if (bflush) {
      flush_block_only(s2, false);
      if (s2.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s2.insert = 0;
  if (flush === Z_FINISH) {
    flush_block_only(s2, true);
    if (s2.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s2.last_lit) {
    flush_block_only(s2, false);
    if (s2.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
const deflate_huff = (s2, flush) => {
  let bflush;
  for (; ; ) {
    if (s2.lookahead === 0) {
      fill_window(s2);
      if (s2.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;
      }
    }
    s2.match_length = 0;
    bflush = _tr_tally$1(s2, 0, s2.window[s2.strstart]);
    s2.lookahead--;
    s2.strstart++;
    if (bflush) {
      flush_block_only(s2, false);
      if (s2.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s2.insert = 0;
  if (flush === Z_FINISH) {
    flush_block_only(s2, true);
    if (s2.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s2.last_lit) {
    flush_block_only(s2, false);
    if (s2.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}
const configuration_table = [
  new Config(0, 0, 0, 0, deflate_stored),
  new Config(4, 4, 8, 4, deflate_fast),
  new Config(4, 5, 16, 8, deflate_fast),
  new Config(4, 6, 32, 32, deflate_fast),
  new Config(4, 4, 16, 16, deflate_slow),
  new Config(8, 16, 32, 32, deflate_slow),
  new Config(8, 16, 128, 128, deflate_slow),
  new Config(8, 32, 128, 256, deflate_slow),
  new Config(32, 128, 258, 1024, deflate_slow),
  new Config(32, 258, 258, 4096, deflate_slow)
];
const lm_init = (s2) => {
  s2.window_size = 2 * s2.w_size;
  zero$1(s2.head);
  s2.max_lazy_match = configuration_table[s2.level].max_lazy;
  s2.good_match = configuration_table[s2.level].good_length;
  s2.nice_match = configuration_table[s2.level].nice_length;
  s2.max_chain_length = configuration_table[s2.level].max_chain;
  s2.strstart = 0;
  s2.block_start = 0;
  s2.lookahead = 0;
  s2.insert = 0;
  s2.match_length = s2.prev_length = MIN_MATCH$1 - 1;
  s2.match_available = 0;
  s2.ins_h = 0;
};
function DeflateState() {
  this.strm = null;
  this.status = 0;
  this.pending_buf = null;
  this.pending_buf_size = 0;
  this.pending_out = 0;
  this.pending = 0;
  this.wrap = 0;
  this.gzhead = null;
  this.gzindex = 0;
  this.method = Z_DEFLATED;
  this.last_flush = -1;
  this.w_size = 0;
  this.w_bits = 0;
  this.w_mask = 0;
  this.window = null;
  this.window_size = 0;
  this.prev = null;
  this.head = null;
  this.ins_h = 0;
  this.hash_size = 0;
  this.hash_bits = 0;
  this.hash_mask = 0;
  this.hash_shift = 0;
  this.block_start = 0;
  this.match_length = 0;
  this.prev_match = 0;
  this.match_available = 0;
  this.strstart = 0;
  this.match_start = 0;
  this.lookahead = 0;
  this.prev_length = 0;
  this.max_chain_length = 0;
  this.max_lazy_match = 0;
  this.level = 0;
  this.strategy = 0;
  this.good_match = 0;
  this.nice_match = 0;
  this.dyn_ltree = new Uint16Array(HEAP_SIZE$1 * 2);
  this.dyn_dtree = new Uint16Array((2 * D_CODES$1 + 1) * 2);
  this.bl_tree = new Uint16Array((2 * BL_CODES$1 + 1) * 2);
  zero$1(this.dyn_ltree);
  zero$1(this.dyn_dtree);
  zero$1(this.bl_tree);
  this.l_desc = null;
  this.d_desc = null;
  this.bl_desc = null;
  this.bl_count = new Uint16Array(MAX_BITS$1 + 1);
  this.heap = new Uint16Array(2 * L_CODES$1 + 1);
  zero$1(this.heap);
  this.heap_len = 0;
  this.heap_max = 0;
  this.depth = new Uint16Array(2 * L_CODES$1 + 1);
  zero$1(this.depth);
  this.l_buf = 0;
  this.lit_bufsize = 0;
  this.last_lit = 0;
  this.d_buf = 0;
  this.opt_len = 0;
  this.static_len = 0;
  this.matches = 0;
  this.insert = 0;
  this.bi_buf = 0;
  this.bi_valid = 0;
}
const deflateResetKeep = (strm) => {
  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }
  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN$1;
  const s2 = strm.state;
  s2.pending = 0;
  s2.pending_out = 0;
  if (s2.wrap < 0) {
    s2.wrap = -s2.wrap;
  }
  s2.status = s2.wrap ? INIT_STATE : BUSY_STATE;
  strm.adler = s2.wrap === 2 ? 0 : 1;
  s2.last_flush = Z_NO_FLUSH;
  _tr_init$1(s2);
  return Z_OK;
};
const deflateReset = (strm) => {
  const ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
};
const deflateSetHeader = (strm, head) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  if (strm.state.wrap !== 2) {
    return Z_STREAM_ERROR;
  }
  strm.state.gzhead = head;
  return Z_OK;
};
const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {
  if (!strm) {
    return Z_STREAM_ERROR;
  }
  let wrap = 1;
  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else if (windowBits > 15) {
    wrap = 2;
    windowBits -= 16;
  }
  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED$1) {
    return err(strm, Z_STREAM_ERROR);
  }
  if (windowBits === 8) {
    windowBits = 9;
  }
  const s2 = new DeflateState();
  strm.state = s2;
  s2.strm = strm;
  s2.wrap = wrap;
  s2.gzhead = null;
  s2.w_bits = windowBits;
  s2.w_size = 1 << s2.w_bits;
  s2.w_mask = s2.w_size - 1;
  s2.hash_bits = memLevel + 7;
  s2.hash_size = 1 << s2.hash_bits;
  s2.hash_mask = s2.hash_size - 1;
  s2.hash_shift = ~~((s2.hash_bits + MIN_MATCH$1 - 1) / MIN_MATCH$1);
  s2.window = new Uint8Array(s2.w_size * 2);
  s2.head = new Uint16Array(s2.hash_size);
  s2.prev = new Uint16Array(s2.w_size);
  s2.lit_bufsize = 1 << memLevel + 6;
  s2.pending_buf_size = s2.lit_bufsize * 4;
  s2.pending_buf = new Uint8Array(s2.pending_buf_size);
  s2.d_buf = 1 * s2.lit_bufsize;
  s2.l_buf = (1 + 2) * s2.lit_bufsize;
  s2.level = level;
  s2.strategy = strategy;
  s2.method = method;
  return deflateReset(strm);
};
const deflateInit = (strm, level) => {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
};
const deflate = (strm, flush) => {
  let beg, val;
  if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }
  const s2 = strm.state;
  if (!strm.output || !strm.input && strm.avail_in !== 0 || s2.status === FINISH_STATE && flush !== Z_FINISH) {
    return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }
  s2.strm = strm;
  const old_flush = s2.last_flush;
  s2.last_flush = flush;
  if (s2.status === INIT_STATE) {
    if (s2.wrap === 2) {
      strm.adler = 0;
      put_byte(s2, 31);
      put_byte(s2, 139);
      put_byte(s2, 8);
      if (!s2.gzhead) {
        put_byte(s2, 0);
        put_byte(s2, 0);
        put_byte(s2, 0);
        put_byte(s2, 0);
        put_byte(s2, 0);
        put_byte(s2, s2.level === 9 ? 2 : s2.strategy >= Z_HUFFMAN_ONLY || s2.level < 2 ? 4 : 0);
        put_byte(s2, OS_CODE);
        s2.status = BUSY_STATE;
      } else {
        put_byte(s2, (s2.gzhead.text ? 1 : 0) + (s2.gzhead.hcrc ? 2 : 0) + (!s2.gzhead.extra ? 0 : 4) + (!s2.gzhead.name ? 0 : 8) + (!s2.gzhead.comment ? 0 : 16));
        put_byte(s2, s2.gzhead.time & 255);
        put_byte(s2, s2.gzhead.time >> 8 & 255);
        put_byte(s2, s2.gzhead.time >> 16 & 255);
        put_byte(s2, s2.gzhead.time >> 24 & 255);
        put_byte(s2, s2.level === 9 ? 2 : s2.strategy >= Z_HUFFMAN_ONLY || s2.level < 2 ? 4 : 0);
        put_byte(s2, s2.gzhead.os & 255);
        if (s2.gzhead.extra && s2.gzhead.extra.length) {
          put_byte(s2, s2.gzhead.extra.length & 255);
          put_byte(s2, s2.gzhead.extra.length >> 8 & 255);
        }
        if (s2.gzhead.hcrc) {
          strm.adler = crc32_1(strm.adler, s2.pending_buf, s2.pending, 0);
        }
        s2.gzindex = 0;
        s2.status = EXTRA_STATE;
      }
    } else {
      let header = Z_DEFLATED + (s2.w_bits - 8 << 4) << 8;
      let level_flags = -1;
      if (s2.strategy >= Z_HUFFMAN_ONLY || s2.level < 2) {
        level_flags = 0;
      } else if (s2.level < 6) {
        level_flags = 1;
      } else if (s2.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= level_flags << 6;
      if (s2.strstart !== 0) {
        header |= PRESET_DICT;
      }
      header += 31 - header % 31;
      s2.status = BUSY_STATE;
      putShortMSB(s2, header);
      if (s2.strstart !== 0) {
        putShortMSB(s2, strm.adler >>> 16);
        putShortMSB(s2, strm.adler & 65535);
      }
      strm.adler = 1;
    }
  }
  if (s2.status === EXTRA_STATE) {
    if (s2.gzhead.extra) {
      beg = s2.pending;
      while (s2.gzindex < (s2.gzhead.extra.length & 65535)) {
        if (s2.pending === s2.pending_buf_size) {
          if (s2.gzhead.hcrc && s2.pending > beg) {
            strm.adler = crc32_1(strm.adler, s2.pending_buf, s2.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s2.pending;
          if (s2.pending === s2.pending_buf_size) {
            break;
          }
        }
        put_byte(s2, s2.gzhead.extra[s2.gzindex] & 255);
        s2.gzindex++;
      }
      if (s2.gzhead.hcrc && s2.pending > beg) {
        strm.adler = crc32_1(strm.adler, s2.pending_buf, s2.pending - beg, beg);
      }
      if (s2.gzindex === s2.gzhead.extra.length) {
        s2.gzindex = 0;
        s2.status = NAME_STATE;
      }
    } else {
      s2.status = NAME_STATE;
    }
  }
  if (s2.status === NAME_STATE) {
    if (s2.gzhead.name) {
      beg = s2.pending;
      do {
        if (s2.pending === s2.pending_buf_size) {
          if (s2.gzhead.hcrc && s2.pending > beg) {
            strm.adler = crc32_1(strm.adler, s2.pending_buf, s2.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s2.pending;
          if (s2.pending === s2.pending_buf_size) {
            val = 1;
            break;
          }
        }
        if (s2.gzindex < s2.gzhead.name.length) {
          val = s2.gzhead.name.charCodeAt(s2.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s2, val);
      } while (val !== 0);
      if (s2.gzhead.hcrc && s2.pending > beg) {
        strm.adler = crc32_1(strm.adler, s2.pending_buf, s2.pending - beg, beg);
      }
      if (val === 0) {
        s2.gzindex = 0;
        s2.status = COMMENT_STATE;
      }
    } else {
      s2.status = COMMENT_STATE;
    }
  }
  if (s2.status === COMMENT_STATE) {
    if (s2.gzhead.comment) {
      beg = s2.pending;
      do {
        if (s2.pending === s2.pending_buf_size) {
          if (s2.gzhead.hcrc && s2.pending > beg) {
            strm.adler = crc32_1(strm.adler, s2.pending_buf, s2.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s2.pending;
          if (s2.pending === s2.pending_buf_size) {
            val = 1;
            break;
          }
        }
        if (s2.gzindex < s2.gzhead.comment.length) {
          val = s2.gzhead.comment.charCodeAt(s2.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s2, val);
      } while (val !== 0);
      if (s2.gzhead.hcrc && s2.pending > beg) {
        strm.adler = crc32_1(strm.adler, s2.pending_buf, s2.pending - beg, beg);
      }
      if (val === 0) {
        s2.status = HCRC_STATE;
      }
    } else {
      s2.status = HCRC_STATE;
    }
  }
  if (s2.status === HCRC_STATE) {
    if (s2.gzhead.hcrc) {
      if (s2.pending + 2 > s2.pending_buf_size) {
        flush_pending(strm);
      }
      if (s2.pending + 2 <= s2.pending_buf_size) {
        put_byte(s2, strm.adler & 255);
        put_byte(s2, strm.adler >> 8 & 255);
        strm.adler = 0;
        s2.status = BUSY_STATE;
      }
    } else {
      s2.status = BUSY_STATE;
    }
  }
  if (s2.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      s2.last_flush = -1;
      return Z_OK;
    }
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }
  if (s2.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }
  if (strm.avail_in !== 0 || s2.lookahead !== 0 || flush !== Z_NO_FLUSH && s2.status !== FINISH_STATE) {
    let bstate = s2.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s2, flush) : s2.strategy === Z_RLE ? deflate_rle(s2, flush) : configuration_table[s2.level].func(s2, flush);
    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s2.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s2.last_flush = -1;
      }
      return Z_OK;
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align$1(s2);
      } else if (flush !== Z_BLOCK) {
        _tr_stored_block$1(s2, 0, 0, false);
        if (flush === Z_FULL_FLUSH) {
          zero$1(s2.head);
          if (s2.lookahead === 0) {
            s2.strstart = 0;
            s2.block_start = 0;
            s2.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s2.last_flush = -1;
        return Z_OK;
      }
    }
  }
  if (flush !== Z_FINISH) {
    return Z_OK;
  }
  if (s2.wrap <= 0) {
    return Z_STREAM_END;
  }
  if (s2.wrap === 2) {
    put_byte(s2, strm.adler & 255);
    put_byte(s2, strm.adler >> 8 & 255);
    put_byte(s2, strm.adler >> 16 & 255);
    put_byte(s2, strm.adler >> 24 & 255);
    put_byte(s2, strm.total_in & 255);
    put_byte(s2, strm.total_in >> 8 & 255);
    put_byte(s2, strm.total_in >> 16 & 255);
    put_byte(s2, strm.total_in >> 24 & 255);
  } else {
    putShortMSB(s2, strm.adler >>> 16);
    putShortMSB(s2, strm.adler & 65535);
  }
  flush_pending(strm);
  if (s2.wrap > 0) {
    s2.wrap = -s2.wrap;
  }
  return s2.pending !== 0 ? Z_OK : Z_STREAM_END;
};
const deflateEnd = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  const status = strm.state.status;
  if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
    return err(strm, Z_STREAM_ERROR);
  }
  strm.state = null;
  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
};
const deflateSetDictionary = (strm, dictionary) => {
  let dictLength = dictionary.length;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  const s2 = strm.state;
  const wrap = s2.wrap;
  if (wrap === 2 || wrap === 1 && s2.status !== INIT_STATE || s2.lookahead) {
    return Z_STREAM_ERROR;
  }
  if (wrap === 1) {
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }
  s2.wrap = 0;
  if (dictLength >= s2.w_size) {
    if (wrap === 0) {
      zero$1(s2.head);
      s2.strstart = 0;
      s2.block_start = 0;
      s2.insert = 0;
    }
    let tmpDict = new Uint8Array(s2.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s2.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s2.w_size;
  }
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s2);
  while (s2.lookahead >= MIN_MATCH$1) {
    let str = s2.strstart;
    let n2 = s2.lookahead - (MIN_MATCH$1 - 1);
    do {
      s2.ins_h = HASH(s2, s2.ins_h, s2.window[str + MIN_MATCH$1 - 1]);
      s2.prev[str & s2.w_mask] = s2.head[s2.ins_h];
      s2.head[s2.ins_h] = str;
      str++;
    } while (--n2);
    s2.strstart = str;
    s2.lookahead = MIN_MATCH$1 - 1;
    fill_window(s2);
  }
  s2.strstart += s2.lookahead;
  s2.block_start = s2.strstart;
  s2.insert = s2.lookahead;
  s2.lookahead = 0;
  s2.match_length = s2.prev_length = MIN_MATCH$1 - 1;
  s2.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s2.wrap = wrap;
  return Z_OK;
};
var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2 = deflate;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = "pako deflate (from Nodeca project)";
var deflate_1 = {
  deflateInit: deflateInit_1,
  deflateInit2: deflateInit2_1,
  deflateReset: deflateReset_1,
  deflateResetKeep: deflateResetKeep_1,
  deflateSetHeader: deflateSetHeader_1,
  deflate: deflate_2,
  deflateEnd: deflateEnd_1,
  deflateSetDictionary: deflateSetDictionary_1,
  deflateInfo
};
const _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
var assign = function(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) {
      continue;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be non-object");
    }
    for (const p2 in source) {
      if (_has(source, p2)) {
        obj[p2] = source[p2];
      }
    }
  }
  return obj;
};
var flattenChunks = (chunks) => {
  let len = 0;
  for (let i2 = 0, l2 = chunks.length; i2 < l2; i2++) {
    len += chunks[i2].length;
  }
  const result = new Uint8Array(len);
  for (let i2 = 0, pos = 0, l2 = chunks.length; i2 < l2; i2++) {
    let chunk = chunks[i2];
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
};
var common = {
  assign,
  flattenChunks
};
let STR_APPLY_UIA_OK = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (__) {
  STR_APPLY_UIA_OK = false;
}
const _utf8len = new Uint8Array(256);
for (let q2 = 0; q2 < 256; q2++) {
  _utf8len[q2] = q2 >= 252 ? 6 : q2 >= 248 ? 5 : q2 >= 240 ? 4 : q2 >= 224 ? 3 : q2 >= 192 ? 2 : 1;
}
_utf8len[254] = _utf8len[254] = 1;
var string2buf = (str) => {
  let buf, c2, c22, m_pos, i2, str_len = str.length, buf_len = 0;
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c2 = str.charCodeAt(m_pos);
    if ((c2 & 64512) === 55296 && m_pos + 1 < str_len) {
      c22 = str.charCodeAt(m_pos + 1);
      if ((c22 & 64512) === 56320) {
        c2 = 65536 + (c2 - 55296 << 10) + (c22 - 56320);
        m_pos++;
      }
    }
    buf_len += c2 < 128 ? 1 : c2 < 2048 ? 2 : c2 < 65536 ? 3 : 4;
  }
  buf = new Uint8Array(buf_len);
  for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
    c2 = str.charCodeAt(m_pos);
    if ((c2 & 64512) === 55296 && m_pos + 1 < str_len) {
      c22 = str.charCodeAt(m_pos + 1);
      if ((c22 & 64512) === 56320) {
        c2 = 65536 + (c2 - 55296 << 10) + (c22 - 56320);
        m_pos++;
      }
    }
    if (c2 < 128) {
      buf[i2++] = c2;
    } else if (c2 < 2048) {
      buf[i2++] = 192 | c2 >>> 6;
      buf[i2++] = 128 | c2 & 63;
    } else if (c2 < 65536) {
      buf[i2++] = 224 | c2 >>> 12;
      buf[i2++] = 128 | c2 >>> 6 & 63;
      buf[i2++] = 128 | c2 & 63;
    } else {
      buf[i2++] = 240 | c2 >>> 18;
      buf[i2++] = 128 | c2 >>> 12 & 63;
      buf[i2++] = 128 | c2 >>> 6 & 63;
      buf[i2++] = 128 | c2 & 63;
    }
  }
  return buf;
};
const buf2binstring = (buf, len) => {
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }
  let result = "";
  for (let i2 = 0; i2 < len; i2++) {
    result += String.fromCharCode(buf[i2]);
  }
  return result;
};
var buf2string = (buf, max) => {
  let i2, out;
  const len = max || buf.length;
  const utf16buf = new Array(len * 2);
  for (out = 0, i2 = 0; i2 < len; ) {
    let c2 = buf[i2++];
    if (c2 < 128) {
      utf16buf[out++] = c2;
      continue;
    }
    let c_len = _utf8len[c2];
    if (c_len > 4) {
      utf16buf[out++] = 65533;
      i2 += c_len - 1;
      continue;
    }
    c2 &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
    while (c_len > 1 && i2 < len) {
      c2 = c2 << 6 | buf[i2++] & 63;
      c_len--;
    }
    if (c_len > 1) {
      utf16buf[out++] = 65533;
      continue;
    }
    if (c2 < 65536) {
      utf16buf[out++] = c2;
    } else {
      c2 -= 65536;
      utf16buf[out++] = 55296 | c2 >> 10 & 1023;
      utf16buf[out++] = 56320 | c2 & 1023;
    }
  }
  return buf2binstring(utf16buf, out);
};
var utf8border = (buf, max) => {
  max = max || buf.length;
  if (max > buf.length) {
    max = buf.length;
  }
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 192) === 128) {
    pos--;
  }
  if (pos < 0) {
    return max;
  }
  if (pos === 0) {
    return max;
  }
  return pos + _utf8len[buf[pos]] > max ? pos : max;
};
var strings = {
  string2buf,
  buf2string,
  utf8border
};
function ZStream() {
  this.input = null;
  this.next_in = 0;
  this.avail_in = 0;
  this.total_in = 0;
  this.output = null;
  this.next_out = 0;
  this.avail_out = 0;
  this.total_out = 0;
  this.msg = "";
  this.state = null;
  this.data_type = 2;
  this.adler = 0;
}
var zstream = ZStream;
const toString = Object.prototype.toString;
const {
  Z_NO_FLUSH: Z_NO_FLUSH$1,
  Z_SYNC_FLUSH,
  Z_FULL_FLUSH: Z_FULL_FLUSH$1,
  Z_FINISH: Z_FINISH$1,
  Z_OK: Z_OK$1,
  Z_STREAM_END: Z_STREAM_END$1,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_DEFLATED: Z_DEFLATED$1
} = constants;
function Deflate(options) {
  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION$1,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY$1
  }, options || {});
  let opt = this.options;
  if (opt.raw && opt.windowBits > 0) {
    opt.windowBits = -opt.windowBits;
  } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
    opt.windowBits += 16;
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status = deflate_1.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy);
  if (status !== Z_OK$1) {
    throw new Error(messages[status]);
  }
  if (opt.header) {
    deflate_1.deflateSetHeader(this.strm, opt.header);
  }
  if (opt.dictionary) {
    let dict;
    if (typeof opt.dictionary === "string") {
      dict = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }
    status = deflate_1.deflateSetDictionary(this.strm, dict);
    if (status !== Z_OK$1) {
      throw new Error(messages[status]);
    }
    this._dict_set = true;
  }
}
Deflate.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;
  if (this.ended) {
    return false;
  }
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH$1 : Z_NO_FLUSH$1;
  if (typeof data === "string") {
    strm.input = strings.string2buf(data);
  } else if (toString.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH$1) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    status = deflate_1.deflate(strm, _flush_mode);
    if (status === Z_STREAM_END$1) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$1;
    }
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Deflate.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Deflate.prototype.onEnd = function(status) {
  if (status === Z_OK$1) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function deflate$1(input, options) {
  const deflator = new Deflate(options);
  deflator.push(input, true);
  if (deflator.err) {
    throw deflator.msg || messages[deflator.err];
  }
  return deflator.result;
}
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}
var Deflate_1 = Deflate;
var deflate_2$1 = deflate$1;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;
var constants$1 = constants;
var deflate_1$1 = {
  Deflate: Deflate_1,
  deflate: deflate_2$1,
  deflateRaw: deflateRaw_1,
  gzip: gzip_1,
  constants: constants$1
};
const BAD = 30;
const TYPE = 12;
var inffast = function inflate_fast(strm, start) {
  let _in;
  let last;
  let _out;
  let beg;
  let end;
  let dmax;
  let wsize;
  let whave;
  let wnext;
  let s_window;
  let hold;
  let bits;
  let lcode;
  let dcode;
  let lmask;
  let dmask;
  let here;
  let op;
  let len;
  let dist;
  let from;
  let from_source;
  let input, output;
  const state = strm.state;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
  dmax = state.dmax;
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;
  top:
    do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }
      here = lcode[hold & lmask];
      dolen:
        for (; ; ) {
          op = here >>> 24;
          hold >>>= op;
          bits -= op;
          op = here >>> 16 & 255;
          if (op === 0) {
            output[_out++] = here & 65535;
          } else if (op & 16) {
            len = here & 65535;
            op &= 15;
            if (op) {
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
              len += hold & (1 << op) - 1;
              hold >>>= op;
              bits -= op;
            }
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = dcode[hold & dmask];
            dodist:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op & 16) {
                  dist = here & 65535;
                  op &= 15;
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                  }
                  dist += hold & (1 << op) - 1;
                  if (dist > dmax) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD;
                    break top;
                  }
                  hold >>>= op;
                  bits -= op;
                  op = _out - beg;
                  if (dist > op) {
                    op = dist - op;
                    if (op > whave) {
                      if (state.sane) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD;
                        break top;
                      }
                    }
                    from = 0;
                    from_source = s_window;
                    if (wnext === 0) {
                      from += wsize - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    } else if (wnext < op) {
                      from += wsize + wnext - op;
                      op -= wnext;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = 0;
                        if (wnext < len) {
                          op = wnext;
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                    } else {
                      from += wnext - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    }
                    while (len > 2) {
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      len -= 3;
                    }
                    if (len) {
                      output[_out++] = from_source[from++];
                      if (len > 1) {
                        output[_out++] = from_source[from++];
                      }
                    }
                  } else {
                    from = _out - dist;
                    do {
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      len -= 3;
                    } while (len > 2);
                    if (len) {
                      output[_out++] = output[from++];
                      if (len > 1) {
                        output[_out++] = output[from++];
                      }
                    }
                  }
                } else if ((op & 64) === 0) {
                  here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dodist;
                } else {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break top;
                }
                break;
              }
          } else if ((op & 64) === 0) {
            here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
            continue dolen;
          } else if (op & 32) {
            state.mode = TYPE;
            break top;
          } else {
            strm.msg = "invalid literal/length code";
            state.mode = BAD;
            break top;
          }
          break;
        }
    } while (_in < last && _out < end);
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
  strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
  state.hold = hold;
  state.bits = bits;
  return;
};
const MAXBITS = 15;
const ENOUGH_LENS = 852;
const ENOUGH_DISTS = 592;
const CODES = 0;
const LENS = 1;
const DISTS = 2;
const lbase = new Uint16Array([
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
]);
const lext = new Uint8Array([
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  72,
  78
]);
const dbase = new Uint16Array([
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
]);
const dext = new Uint8Array([
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
]);
const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
  const bits = opts.bits;
  let len = 0;
  let sym = 0;
  let min = 0, max = 0;
  let root = 0;
  let curr = 0;
  let drop = 0;
  let left = 0;
  let used = 0;
  let huff = 0;
  let incr;
  let fill;
  let low;
  let mask;
  let next;
  let base = null;
  let base_index = 0;
  let end;
  const count = new Uint16Array(MAXBITS + 1);
  const offs = new Uint16Array(MAXBITS + 1);
  let extra = null;
  let extra_index = 0;
  let here_bits, here_op, here_val;
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) {
      break;
    }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    opts.bits = 1;
    return 0;
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) {
      break;
    }
  }
  if (root < min) {
    root = min;
  }
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;
  }
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }
  if (type === CODES) {
    base = extra = work;
    end = 19;
  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;
  } else {
    base = dbase;
    extra = dext;
    end = -1;
  }
  huff = 0;
  sym = 0;
  len = min;
  next = table_index;
  curr = root;
  drop = 0;
  low = -1;
  used = 1 << root;
  mask = used - 1;
  if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
    return 1;
  }
  for (; ; ) {
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    } else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    } else {
      here_op = 32 + 64;
      here_val = 0;
    }
    incr = 1 << len - drop;
    fill = 1 << curr;
    min = fill;
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
    } while (fill !== 0);
    incr = 1 << len - 1;
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }
    sym++;
    if (--count[len] === 0) {
      if (len === max) {
        break;
      }
      len = lens[lens_index + work[sym]];
    }
    if (len > root && (huff & mask) !== low) {
      if (drop === 0) {
        drop = root;
      }
      next += min;
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) {
          break;
        }
        curr++;
        left <<= 1;
      }
      used += 1 << curr;
      if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
        return 1;
      }
      low = huff & mask;
      table[low] = root << 24 | curr << 16 | next - table_index | 0;
    }
  }
  if (huff !== 0) {
    table[next + huff] = len - drop << 24 | 64 << 16 | 0;
  }
  opts.bits = root;
  return 0;
};
var inftrees = inflate_table;
const CODES$1 = 0;
const LENS$1 = 1;
const DISTS$1 = 2;
const {
  Z_FINISH: Z_FINISH$2,
  Z_BLOCK: Z_BLOCK$1,
  Z_TREES,
  Z_OK: Z_OK$2,
  Z_STREAM_END: Z_STREAM_END$2,
  Z_NEED_DICT,
  Z_STREAM_ERROR: Z_STREAM_ERROR$1,
  Z_DATA_ERROR: Z_DATA_ERROR$1,
  Z_MEM_ERROR,
  Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFLATED: Z_DEFLATED$2
} = constants;
const HEAD = 1;
const FLAGS = 2;
const TIME = 3;
const OS = 4;
const EXLEN = 5;
const EXTRA = 6;
const NAME = 7;
const COMMENT = 8;
const HCRC = 9;
const DICTID = 10;
const DICT = 11;
const TYPE$1 = 12;
const TYPEDO = 13;
const STORED = 14;
const COPY_ = 15;
const COPY = 16;
const TABLE = 17;
const LENLENS = 18;
const CODELENS = 19;
const LEN_ = 20;
const LEN = 21;
const LENEXT = 22;
const DIST = 23;
const DISTEXT = 24;
const MATCH = 25;
const LIT = 26;
const CHECK = 27;
const LENGTH = 28;
const DONE = 29;
const BAD$1 = 30;
const MEM = 31;
const SYNC = 32;
const ENOUGH_LENS$1 = 852;
const ENOUGH_DISTS$1 = 592;
const MAX_WBITS$1 = 15;
const DEF_WBITS = MAX_WBITS$1;
const zswap32 = (q2) => {
  return (q2 >>> 24 & 255) + (q2 >>> 8 & 65280) + ((q2 & 65280) << 8) + ((q2 & 255) << 24);
};
function InflateState() {
  this.mode = 0;
  this.last = false;
  this.wrap = 0;
  this.havedict = false;
  this.flags = 0;
  this.dmax = 0;
  this.check = 0;
  this.total = 0;
  this.head = null;
  this.wbits = 0;
  this.wsize = 0;
  this.whave = 0;
  this.wnext = 0;
  this.window = null;
  this.hold = 0;
  this.bits = 0;
  this.length = 0;
  this.offset = 0;
  this.extra = 0;
  this.lencode = null;
  this.distcode = null;
  this.lenbits = 0;
  this.distbits = 0;
  this.ncode = 0;
  this.nlen = 0;
  this.ndist = 0;
  this.have = 0;
  this.next = null;
  this.lens = new Uint16Array(320);
  this.work = new Uint16Array(288);
  this.lendyn = null;
  this.distdyn = null;
  this.sane = 0;
  this.back = 0;
  this.was = 0;
}
const inflateResetKeep = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = "";
  if (state.wrap) {
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null;
  state.hold = 0;
  state.bits = 0;
  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS$1);
  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS$1);
  state.sane = 1;
  state.back = -1;
  return Z_OK$2;
};
const inflateReset = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);
};
const inflateReset2 = (strm, windowBits) => {
  let wrap;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
};
const inflateInit2 = (strm, windowBits) => {
  if (!strm) {
    return Z_STREAM_ERROR$1;
  }
  const state = new InflateState();
  strm.state = state;
  state.window = null;
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$2) {
    strm.state = null;
  }
  return ret;
};
const inflateInit = (strm) => {
  return inflateInit2(strm, DEF_WBITS);
};
let virgin = true;
let lenfix, distfix;
const fixedtables = (state) => {
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);
    let sym = 0;
    while (sym < 144) {
      state.lens[sym++] = 8;
    }
    while (sym < 256) {
      state.lens[sym++] = 9;
    }
    while (sym < 280) {
      state.lens[sym++] = 7;
    }
    while (sym < 288) {
      state.lens[sym++] = 8;
    }
    inftrees(LENS$1, state.lens, 0, 288, lenfix, 0, state.work, {bits: 9});
    sym = 0;
    while (sym < 32) {
      state.lens[sym++] = 5;
    }
    inftrees(DISTS$1, state.lens, 0, 32, distfix, 0, state.work, {bits: 5});
    virgin = false;
  }
  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
};
const updatewindow = (strm, src, end, copy) => {
  let dist;
  const state = strm.state;
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;
    state.window = new Uint8Array(state.wsize);
  }
  if (copy >= state.wsize) {
    state.window.set(src.subarray(end - state.wsize, end), 0);
    state.wnext = 0;
    state.whave = state.wsize;
  } else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
    copy -= dist;
    if (copy) {
      state.window.set(src.subarray(end - copy, end), 0);
      state.wnext = copy;
      state.whave = state.wsize;
    } else {
      state.wnext += dist;
      if (state.wnext === state.wsize) {
        state.wnext = 0;
      }
      if (state.whave < state.wsize) {
        state.whave += dist;
      }
    }
  }
  return 0;
};
const inflate = (strm, flush) => {
  let state;
  let input, output;
  let next;
  let put;
  let have, left;
  let hold;
  let bits;
  let _in, _out;
  let copy;
  let from;
  let from_source;
  let here = 0;
  let here_bits, here_op, here_val;
  let last_bits, last_op, last_val;
  let len;
  let ret;
  const hbuf = new Uint8Array(4);
  let opts;
  let n2;
  const order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
    return Z_STREAM_ERROR$1;
  }
  state = strm.state;
  if (state.mode === TYPE$1) {
    state.mode = TYPEDO;
  }
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  _in = have;
  _out = left;
  ret = Z_OK$2;
  inf_leave:
    for (; ; ) {
      switch (state.mode) {
        case HEAD:
          if (state.wrap === 0) {
            state.mode = TYPEDO;
            break;
          }
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.wrap & 2 && hold === 35615) {
            state.check = 0;
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            hold = 0;
            bits = 0;
            state.mode = FLAGS;
            break;
          }
          state.flags = 0;
          if (state.head) {
            state.head.done = false;
          }
          if (!(state.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
            strm.msg = "incorrect header check";
            state.mode = BAD$1;
            break;
          }
          if ((hold & 15) !== Z_DEFLATED$2) {
            strm.msg = "unknown compression method";
            state.mode = BAD$1;
            break;
          }
          hold >>>= 4;
          bits -= 4;
          len = (hold & 15) + 8;
          if (state.wbits === 0) {
            state.wbits = len;
          } else if (len > state.wbits) {
            strm.msg = "invalid window size";
            state.mode = BAD$1;
            break;
          }
          state.dmax = 1 << state.wbits;
          strm.adler = state.check = 1;
          state.mode = hold & 512 ? DICTID : TYPE$1;
          hold = 0;
          bits = 0;
          break;
        case FLAGS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.flags = hold;
          if ((state.flags & 255) !== Z_DEFLATED$2) {
            strm.msg = "unknown compression method";
            state.mode = BAD$1;
            break;
          }
          if (state.flags & 57344) {
            strm.msg = "unknown header flags set";
            state.mode = BAD$1;
            break;
          }
          if (state.head) {
            state.head.text = hold >> 8 & 1;
          }
          if (state.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = TIME;
        case TIME:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.head) {
            state.head.time = hold;
          }
          if (state.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            hbuf[2] = hold >>> 16 & 255;
            hbuf[3] = hold >>> 24 & 255;
            state.check = crc32_1(state.check, hbuf, 4, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = OS;
        case OS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.head) {
            state.head.xflags = hold & 255;
            state.head.os = hold >> 8;
          }
          if (state.flags & 512) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = EXLEN;
        case EXLEN:
          if (state.flags & 1024) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.length = hold;
            if (state.head) {
              state.head.extra_len = hold;
            }
            if (state.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
          } else if (state.head) {
            state.head.extra = null;
          }
          state.mode = EXTRA;
        case EXTRA:
          if (state.flags & 1024) {
            copy = state.length;
            if (copy > have) {
              copy = have;
            }
            if (copy) {
              if (state.head) {
                len = state.head.extra_len - state.length;
                if (!state.head.extra) {
                  state.head.extra = new Uint8Array(state.head.extra_len);
                }
                state.head.extra.set(input.subarray(next, next + copy), len);
              }
              if (state.flags & 512) {
                state.check = crc32_1(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              state.length -= copy;
            }
            if (state.length) {
              break inf_leave;
            }
          }
          state.length = 0;
          state.mode = NAME;
        case NAME:
          if (state.flags & 2048) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state.head && len && state.length < 65536) {
                state.head.name += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state.flags & 512) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.name = null;
          }
          state.length = 0;
          state.mode = COMMENT;
        case COMMENT:
          if (state.flags & 4096) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state.head && len && state.length < 65536) {
                state.head.comment += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state.flags & 512) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.comment = null;
          }
          state.mode = HCRC;
        case HCRC:
          if (state.flags & 512) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (hold !== (state.check & 65535)) {
              strm.msg = "header crc mismatch";
              state.mode = BAD$1;
              break;
            }
            hold = 0;
            bits = 0;
          }
          if (state.head) {
            state.head.hcrc = state.flags >> 9 & 1;
            state.head.done = true;
          }
          strm.adler = state.check = 0;
          state.mode = TYPE$1;
          break;
        case DICTID:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          strm.adler = state.check = zswap32(hold);
          hold = 0;
          bits = 0;
          state.mode = DICT;
        case DICT:
          if (state.havedict === 0) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            return Z_NEED_DICT;
          }
          strm.adler = state.check = 1;
          state.mode = TYPE$1;
        case TYPE$1:
          if (flush === Z_BLOCK$1 || flush === Z_TREES) {
            break inf_leave;
          }
        case TYPEDO:
          if (state.last) {
            hold >>>= bits & 7;
            bits -= bits & 7;
            state.mode = CHECK;
            break;
          }
          while (bits < 3) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.last = hold & 1;
          hold >>>= 1;
          bits -= 1;
          switch (hold & 3) {
            case 0:
              state.mode = STORED;
              break;
            case 1:
              fixedtables(state);
              state.mode = LEN_;
              if (flush === Z_TREES) {
                hold >>>= 2;
                bits -= 2;
                break inf_leave;
              }
              break;
            case 2:
              state.mode = TABLE;
              break;
            case 3:
              strm.msg = "invalid block type";
              state.mode = BAD$1;
          }
          hold >>>= 2;
          bits -= 2;
          break;
        case STORED:
          hold >>>= bits & 7;
          bits -= bits & 7;
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
            strm.msg = "invalid stored block lengths";
            state.mode = BAD$1;
            break;
          }
          state.length = hold & 65535;
          hold = 0;
          bits = 0;
          state.mode = COPY_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        case COPY_:
          state.mode = COPY;
        case COPY:
          copy = state.length;
          if (copy) {
            if (copy > have) {
              copy = have;
            }
            if (copy > left) {
              copy = left;
            }
            if (copy === 0) {
              break inf_leave;
            }
            output.set(input.subarray(next, next + copy), put);
            have -= copy;
            next += copy;
            left -= copy;
            put += copy;
            state.length -= copy;
            break;
          }
          state.mode = TYPE$1;
          break;
        case TABLE:
          while (bits < 14) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.nlen = (hold & 31) + 257;
          hold >>>= 5;
          bits -= 5;
          state.ndist = (hold & 31) + 1;
          hold >>>= 5;
          bits -= 5;
          state.ncode = (hold & 15) + 4;
          hold >>>= 4;
          bits -= 4;
          if (state.nlen > 286 || state.ndist > 30) {
            strm.msg = "too many length or distance symbols";
            state.mode = BAD$1;
            break;
          }
          state.have = 0;
          state.mode = LENLENS;
        case LENLENS:
          while (state.have < state.ncode) {
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.lens[order[state.have++]] = hold & 7;
            hold >>>= 3;
            bits -= 3;
          }
          while (state.have < 19) {
            state.lens[order[state.have++]] = 0;
          }
          state.lencode = state.lendyn;
          state.lenbits = 7;
          opts = {bits: state.lenbits};
          ret = inftrees(CODES$1, state.lens, 0, 19, state.lencode, 0, state.work, opts);
          state.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid code lengths set";
            state.mode = BAD$1;
            break;
          }
          state.have = 0;
          state.mode = CODELENS;
        case CODELENS:
          while (state.have < state.nlen + state.ndist) {
            for (; ; ) {
              here = state.lencode[hold & (1 << state.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_val < 16) {
              hold >>>= here_bits;
              bits -= here_bits;
              state.lens[state.have++] = here_val;
            } else {
              if (here_val === 16) {
                n2 = here_bits + 2;
                while (bits < n2) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                if (state.have === 0) {
                  strm.msg = "invalid bit length repeat";
                  state.mode = BAD$1;
                  break;
                }
                len = state.lens[state.have - 1];
                copy = 3 + (hold & 3);
                hold >>>= 2;
                bits -= 2;
              } else if (here_val === 17) {
                n2 = here_bits + 3;
                while (bits < n2) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 3 + (hold & 7);
                hold >>>= 3;
                bits -= 3;
              } else {
                n2 = here_bits + 7;
                while (bits < n2) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 11 + (hold & 127);
                hold >>>= 7;
                bits -= 7;
              }
              if (state.have + copy > state.nlen + state.ndist) {
                strm.msg = "invalid bit length repeat";
                state.mode = BAD$1;
                break;
              }
              while (copy--) {
                state.lens[state.have++] = len;
              }
            }
          }
          if (state.mode === BAD$1) {
            break;
          }
          if (state.lens[256] === 0) {
            strm.msg = "invalid code -- missing end-of-block";
            state.mode = BAD$1;
            break;
          }
          state.lenbits = 9;
          opts = {bits: state.lenbits};
          ret = inftrees(LENS$1, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
          state.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid literal/lengths set";
            state.mode = BAD$1;
            break;
          }
          state.distbits = 6;
          state.distcode = state.distdyn;
          opts = {bits: state.distbits};
          ret = inftrees(DISTS$1, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
          state.distbits = opts.bits;
          if (ret) {
            strm.msg = "invalid distances set";
            state.mode = BAD$1;
            break;
          }
          state.mode = LEN_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        case LEN_:
          state.mode = LEN;
        case LEN:
          if (have >= 6 && left >= 258) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            inffast(strm, _out);
            put = strm.next_out;
            output = strm.output;
            left = strm.avail_out;
            next = strm.next_in;
            input = strm.input;
            have = strm.avail_in;
            hold = state.hold;
            bits = state.bits;
            if (state.mode === TYPE$1) {
              state.back = -1;
            }
            break;
          }
          state.back = 0;
          for (; ; ) {
            here = state.lencode[hold & (1 << state.lenbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (here_op && (here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state.back += here_bits;
          state.length = here_val;
          if (here_op === 0) {
            state.mode = LIT;
            break;
          }
          if (here_op & 32) {
            state.back = -1;
            state.mode = TYPE$1;
            break;
          }
          if (here_op & 64) {
            strm.msg = "invalid literal/length code";
            state.mode = BAD$1;
            break;
          }
          state.extra = here_op & 15;
          state.mode = LENEXT;
        case LENEXT:
          if (state.extra) {
            n2 = state.extra;
            while (bits < n2) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.length += hold & (1 << state.extra) - 1;
            hold >>>= state.extra;
            bits -= state.extra;
            state.back += state.extra;
          }
          state.was = state.length;
          state.mode = DIST;
        case DIST:
          for (; ; ) {
            here = state.distcode[hold & (1 << state.distbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state.back += here_bits;
          if (here_op & 64) {
            strm.msg = "invalid distance code";
            state.mode = BAD$1;
            break;
          }
          state.offset = here_val;
          state.extra = here_op & 15;
          state.mode = DISTEXT;
        case DISTEXT:
          if (state.extra) {
            n2 = state.extra;
            while (bits < n2) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.offset += hold & (1 << state.extra) - 1;
            hold >>>= state.extra;
            bits -= state.extra;
            state.back += state.extra;
          }
          if (state.offset > state.dmax) {
            strm.msg = "invalid distance too far back";
            state.mode = BAD$1;
            break;
          }
          state.mode = MATCH;
        case MATCH:
          if (left === 0) {
            break inf_leave;
          }
          copy = _out - left;
          if (state.offset > copy) {
            copy = state.offset - copy;
            if (copy > state.whave) {
              if (state.sane) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD$1;
                break;
              }
            }
            if (copy > state.wnext) {
              copy -= state.wnext;
              from = state.wsize - copy;
            } else {
              from = state.wnext - copy;
            }
            if (copy > state.length) {
              copy = state.length;
            }
            from_source = state.window;
          } else {
            from_source = output;
            from = put - state.offset;
            copy = state.length;
          }
          if (copy > left) {
            copy = left;
          }
          left -= copy;
          state.length -= copy;
          do {
            output[put++] = from_source[from++];
          } while (--copy);
          if (state.length === 0) {
            state.mode = LEN;
          }
          break;
        case LIT:
          if (left === 0) {
            break inf_leave;
          }
          output[put++] = state.length;
          left--;
          state.mode = LEN;
          break;
        case CHECK:
          if (state.wrap) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold |= input[next++] << bits;
              bits += 8;
            }
            _out -= left;
            strm.total_out += _out;
            state.total += _out;
            if (_out) {
              strm.adler = state.check = state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out);
            }
            _out = left;
            if ((state.flags ? hold : zswap32(hold)) !== state.check) {
              strm.msg = "incorrect data check";
              state.mode = BAD$1;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state.mode = LENGTH;
        case LENGTH:
          if (state.wrap && state.flags) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (hold !== (state.total & 4294967295)) {
              strm.msg = "incorrect length check";
              state.mode = BAD$1;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state.mode = DONE;
        case DONE:
          ret = Z_STREAM_END$2;
          break inf_leave;
        case BAD$1:
          ret = Z_DATA_ERROR$1;
          break inf_leave;
        case MEM:
          return Z_MEM_ERROR;
        case SYNC:
        default:
          return Z_STREAM_ERROR$1;
      }
    }
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  if (state.wsize || _out !== strm.avail_out && state.mode < BAD$1 && (state.mode < CHECK || flush !== Z_FINISH$2)) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out))
      ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out);
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE$1 ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if ((_in === 0 && _out === 0 || flush === Z_FINISH$2) && ret === Z_OK$2) {
    ret = Z_BUF_ERROR$1;
  }
  return ret;
};
const inflateEnd = (strm) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  let state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$2;
};
const inflateGetHeader = (strm, head) => {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  if ((state.wrap & 2) === 0) {
    return Z_STREAM_ERROR$1;
  }
  state.head = head;
  head.done = false;
  return Z_OK$2;
};
const inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;
  let state;
  let dictid;
  let ret;
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR$1;
  }
  state = strm.state;
  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }
  if (state.mode === DICT) {
    dictid = 1;
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  return Z_OK$2;
};
var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2 = inflate;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = "pako inflate (from Nodeca project)";
var inflate_1 = {
  inflateReset: inflateReset_1,
  inflateReset2: inflateReset2_1,
  inflateResetKeep: inflateResetKeep_1,
  inflateInit: inflateInit_1,
  inflateInit2: inflateInit2_1,
  inflate: inflate_2,
  inflateEnd: inflateEnd_1,
  inflateGetHeader: inflateGetHeader_1,
  inflateSetDictionary: inflateSetDictionary_1,
  inflateInfo
};
function GZheader() {
  this.text = 0;
  this.time = 0;
  this.xflags = 0;
  this.os = 0;
  this.extra = null;
  this.extra_len = 0;
  this.name = "";
  this.comment = "";
  this.hcrc = 0;
  this.done = false;
}
var gzheader = GZheader;
const toString$1 = Object.prototype.toString;
const {
  Z_NO_FLUSH: Z_NO_FLUSH$2,
  Z_FINISH: Z_FINISH$3,
  Z_OK: Z_OK$3,
  Z_STREAM_END: Z_STREAM_END$3,
  Z_NEED_DICT: Z_NEED_DICT$1,
  Z_STREAM_ERROR: Z_STREAM_ERROR$2,
  Z_DATA_ERROR: Z_DATA_ERROR$2,
  Z_MEM_ERROR: Z_MEM_ERROR$1
} = constants;
function Inflate(options) {
  this.options = common.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ""
  }, options || {});
  const opt = this.options;
  if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) {
      opt.windowBits = -15;
    }
  }
  if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
    opt.windowBits += 32;
  }
  if (opt.windowBits > 15 && opt.windowBits < 48) {
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status = inflate_1.inflateInit2(this.strm, opt.windowBits);
  if (status !== Z_OK$3) {
    throw new Error(messages[status]);
  }
  this.header = new gzheader();
  inflate_1.inflateGetHeader(this.strm, this.header);
  if (opt.dictionary) {
    if (typeof opt.dictionary === "string") {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) {
      status = inflate_1.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK$3) {
        throw new Error(messages[status]);
      }
    }
  }
}
Inflate.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;
  if (this.ended)
    return false;
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH$3 : Z_NO_FLUSH$2;
  if (toString$1.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = inflate_1.inflate(strm, _flush_mode);
    if (status === Z_NEED_DICT$1 && dictionary) {
      status = inflate_1.inflateSetDictionary(strm, dictionary);
      if (status === Z_OK$3) {
        status = inflate_1.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR$2) {
        status = Z_NEED_DICT$1;
      }
    }
    while (strm.avail_in > 0 && status === Z_STREAM_END$3 && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
      inflate_1.inflateReset(strm);
      status = inflate_1.inflate(strm, _flush_mode);
    }
    switch (status) {
      case Z_STREAM_ERROR$2:
      case Z_DATA_ERROR$2:
      case Z_NEED_DICT$1:
      case Z_MEM_ERROR$1:
        this.onEnd(status);
        this.ended = true;
        return false;
    }
    last_avail_out = strm.avail_out;
    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END$3) {
        if (this.options.to === "string") {
          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail)
            strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
          this.onData(utf8str);
        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }
    if (status === Z_OK$3 && last_avail_out === 0)
      continue;
    if (status === Z_STREAM_END$3) {
      status = inflate_1.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Inflate.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Inflate.prototype.onEnd = function(status) {
  if (status === Z_OK$3) {
    if (this.options.to === "string") {
      this.result = this.chunks.join("");
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function inflate$1(input, options) {
  const inflator = new Inflate(options);
  inflator.push(input);
  if (inflator.err)
    throw inflator.msg || messages[inflator.err];
  return inflator.result;
}
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}
var Inflate_1 = Inflate;
var inflate_2$1 = inflate$1;
var inflateRaw_1 = inflateRaw;
var ungzip = inflate$1;
var constants$2 = constants;
var inflate_1$1 = {
  Inflate: Inflate_1,
  inflate: inflate_2$1,
  inflateRaw: inflateRaw_1,
  ungzip,
  constants: constants$2
};
const {Deflate: Deflate$1, deflate: deflate$2, deflateRaw: deflateRaw$1, gzip: gzip$1} = deflate_1$1;
const {Inflate: Inflate$1, inflate: inflate$2, inflateRaw: inflateRaw$1, ungzip: ungzip$1} = inflate_1$1;
var Deflate_1$1 = Deflate$1;
var deflate_1$2 = deflate$2;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;
var Inflate_1$1 = Inflate$1;
var inflate_1$2 = inflate$2;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip_1 = ungzip$1;
var constants_1 = constants;
var pako = {
  Deflate: Deflate_1$1,
  deflate: deflate_1$2,
  deflateRaw: deflateRaw_1$1,
  gzip: gzip_1$1,
  Inflate: Inflate_1$1,
  inflate: inflate_1$2,
  inflateRaw: inflateRaw_1$1,
  ungzip: ungzip_1,
  constants: constants_1
};
class GZip {
  constructor(level = 1) {
    if (level < 0 || level > 9) {
      throw new Error("Invalid gzip compression level, it should be between 0 and 9");
    }
    this.level = level;
  }
  static fromConfig({level}) {
    return new GZip(level);
  }
  encode(data) {
    const gzipped = pako.gzip(data, {level: this.level});
    return gzipped;
  }
  decode(data, out) {
    const uncompressed = pako.ungzip(data);
    if (out !== void 0) {
      out.set(uncompressed);
      return out;
    }
    return uncompressed;
  }
}
GZip.codecId = "gzip";
class Zlib {
  constructor(level = 1) {
    if (level < -1 || level > 9) {
      throw new Error("Invalid zlib compression level, it should be between -1 and 9");
    }
    this.level = level;
  }
  static fromConfig({level}) {
    return new Zlib(level);
  }
  encode(data) {
    const gzipped = pako.deflate(data, {level: this.level});
    return gzipped;
  }
  decode(data, out) {
    const uncompressed = pako.inflate(data);
    if (out !== void 0) {
      out.set(uncompressed);
      return out;
    }
    return uncompressed;
  }
}
Zlib.codecId = "zlib";
const IS_NODE$1 = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
let __toBinary = IS_NODE$1 ? (base64) => new Uint8Array(Buffer.from(base64, "base64")) : /* @__PURE__ */ (() => {
  var table = new Uint8Array(128);
  for (var i2 = 0; i2 < 64; i2++)
    table[i2 < 26 ? i2 + 65 : i2 < 52 ? i2 + 71 : i2 < 62 ? i2 - 4 : i2 * 4 - 205] = i2;
  return (base64) => {
    var n2 = base64.length;
    var bytes = new Uint8Array((n2 - (base64[n2 - 1] == "=") - (base64[n2 - 2] == "=")) * 3 / 4 | 0);
    for (var i3 = 0, j2 = 0; i3 < n2; ) {
      var c0 = table[base64.charCodeAt(i3++)], c1 = table[base64.charCodeAt(i3++)];
      var c2 = table[base64.charCodeAt(i3++)], c3 = table[base64.charCodeAt(i3++)];
      bytes[j2++] = c0 << 2 | c1 >> 4;
      bytes[j2++] = c1 << 4 | c2 >> 2;
      bytes[j2++] = c2 << 6 | c3;
    }
    return bytes;
  };
})();
function initEmscriptenModule(moduleFactory, src) {
  const wasmBinary = __toBinary(src);
  return moduleFactory({noInitialRun: true, wasmBinary});
}
var blosc_codec = function() {
  typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
  return function(blosc_codec2) {
    blosc_codec2 = blosc_codec2 || {};
    var f2;
    f2 || (f2 = typeof blosc_codec2 !== "undefined" ? blosc_codec2 : {});
    var aa, ba;
    f2.ready = new Promise(function(a2, b2) {
      aa = a2;
      ba = b2;
    });
    var r2 = {}, t2;
    for (t2 in f2)
      f2.hasOwnProperty(t2) && (r2[t2] = f2[t2]);
    var ca = "./this.program", da = f2.print || console.log.bind(console), u2 = f2.printErr || console.warn.bind(console);
    for (t2 in r2)
      r2.hasOwnProperty(t2) && (f2[t2] = r2[t2]);
    r2 = null;
    f2.thisProgram && (ca = f2.thisProgram);
    var v2;
    f2.wasmBinary && (v2 = f2.wasmBinary);
    f2.noExitRuntime && f2.noExitRuntime;
    typeof WebAssembly !== "object" && w2("no native wasm support detected");
    var y, ea = false, fa = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : void 0;
    function ha(a2, b2, c2) {
      var d2 = b2 + c2;
      for (c2 = b2; a2[c2] && !(c2 >= d2); )
        ++c2;
      if (16 < c2 - b2 && a2.subarray && fa)
        return fa.decode(a2.subarray(b2, c2));
      for (d2 = ""; b2 < c2; ) {
        var e2 = a2[b2++];
        if (e2 & 128) {
          var g2 = a2[b2++] & 63;
          if ((e2 & 224) == 192)
            d2 += String.fromCharCode((e2 & 31) << 6 | g2);
          else {
            var k2 = a2[b2++] & 63;
            e2 = (e2 & 240) == 224 ? (e2 & 15) << 12 | g2 << 6 | k2 : (e2 & 7) << 18 | g2 << 12 | k2 << 6 | a2[b2++] & 63;
            65536 > e2 ? d2 += String.fromCharCode(e2) : (e2 -= 65536, d2 += String.fromCharCode(55296 | e2 >> 10, 56320 | e2 & 1023));
          }
        } else
          d2 += String.fromCharCode(e2);
      }
      return d2;
    }
    function ia(a2, b2, c2) {
      var d2 = z2;
      if (0 < c2) {
        c2 = b2 + c2 - 1;
        for (var e2 = 0; e2 < a2.length; ++e2) {
          var g2 = a2.charCodeAt(e2);
          if (55296 <= g2 && 57343 >= g2) {
            var k2 = a2.charCodeAt(++e2);
            g2 = 65536 + ((g2 & 1023) << 10) | k2 & 1023;
          }
          if (127 >= g2) {
            if (b2 >= c2)
              break;
            d2[b2++] = g2;
          } else {
            if (2047 >= g2) {
              if (b2 + 1 >= c2)
                break;
              d2[b2++] = 192 | g2 >> 6;
            } else {
              if (65535 >= g2) {
                if (b2 + 2 >= c2)
                  break;
                d2[b2++] = 224 | g2 >> 12;
              } else {
                if (b2 + 3 >= c2)
                  break;
                d2[b2++] = 240 | g2 >> 18;
                d2[b2++] = 128 | g2 >> 12 & 63;
              }
              d2[b2++] = 128 | g2 >> 6 & 63;
            }
            d2[b2++] = 128 | g2 & 63;
          }
        }
        d2[b2] = 0;
      }
    }
    var ja = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : void 0;
    function ka(a2, b2) {
      var c2 = a2 >> 1;
      for (var d2 = c2 + b2 / 2; !(c2 >= d2) && A2[c2]; )
        ++c2;
      c2 <<= 1;
      if (32 < c2 - a2 && ja)
        return ja.decode(z2.subarray(a2, c2));
      c2 = 0;
      for (d2 = ""; ; ) {
        var e2 = C2[a2 + 2 * c2 >> 1];
        if (e2 == 0 || c2 == b2 / 2)
          return d2;
        ++c2;
        d2 += String.fromCharCode(e2);
      }
    }
    function la(a2, b2, c2) {
      c2 === void 0 && (c2 = 2147483647);
      if (2 > c2)
        return 0;
      c2 -= 2;
      var d2 = b2;
      c2 = c2 < 2 * a2.length ? c2 / 2 : a2.length;
      for (var e2 = 0; e2 < c2; ++e2)
        C2[b2 >> 1] = a2.charCodeAt(e2), b2 += 2;
      C2[b2 >> 1] = 0;
      return b2 - d2;
    }
    function ma(a2) {
      return 2 * a2.length;
    }
    function na(a2, b2) {
      for (var c2 = 0, d2 = ""; !(c2 >= b2 / 4); ) {
        var e2 = D[a2 + 4 * c2 >> 2];
        if (e2 == 0)
          break;
        ++c2;
        65536 <= e2 ? (e2 -= 65536, d2 += String.fromCharCode(55296 | e2 >> 10, 56320 | e2 & 1023)) : d2 += String.fromCharCode(e2);
      }
      return d2;
    }
    function oa(a2, b2, c2) {
      c2 === void 0 && (c2 = 2147483647);
      if (4 > c2)
        return 0;
      var d2 = b2;
      c2 = d2 + c2 - 4;
      for (var e2 = 0; e2 < a2.length; ++e2) {
        var g2 = a2.charCodeAt(e2);
        if (55296 <= g2 && 57343 >= g2) {
          var k2 = a2.charCodeAt(++e2);
          g2 = 65536 + ((g2 & 1023) << 10) | k2 & 1023;
        }
        D[b2 >> 2] = g2;
        b2 += 4;
        if (b2 + 4 > c2)
          break;
      }
      D[b2 >> 2] = 0;
      return b2 - d2;
    }
    function pa(a2) {
      for (var b2 = 0, c2 = 0; c2 < a2.length; ++c2) {
        var d2 = a2.charCodeAt(c2);
        55296 <= d2 && 57343 >= d2 && ++c2;
        b2 += 4;
      }
      return b2;
    }
    var E, F, z2, C2, A2, D, G2, qa, ra;
    function sa(a2) {
      E = a2;
      f2.HEAP8 = F = new Int8Array(a2);
      f2.HEAP16 = C2 = new Int16Array(a2);
      f2.HEAP32 = D = new Int32Array(a2);
      f2.HEAPU8 = z2 = new Uint8Array(a2);
      f2.HEAPU16 = A2 = new Uint16Array(a2);
      f2.HEAPU32 = G2 = new Uint32Array(a2);
      f2.HEAPF32 = qa = new Float32Array(a2);
      f2.HEAPF64 = ra = new Float64Array(a2);
    }
    var ta = f2.INITIAL_MEMORY || 16777216;
    f2.wasmMemory ? y = f2.wasmMemory : y = new WebAssembly.Memory({initial: ta / 65536, maximum: 32768});
    y && (E = y.buffer);
    ta = E.byteLength;
    sa(E);
    var I2, ua = [], va = [], wa = [], xa = [];
    function ya() {
      var a2 = f2.preRun.shift();
      ua.unshift(a2);
    }
    var J = 0, K2 = null;
    f2.preloadedImages = {};
    f2.preloadedAudios = {};
    function w2(a2) {
      if (f2.onAbort)
        f2.onAbort(a2);
      u2(a2);
      ea = true;
      a2 = new WebAssembly.RuntimeError("abort(" + a2 + "). Build with -s ASSERTIONS=1 for more info.");
      ba(a2);
      throw a2;
    }
    function Aa(a2) {
      var b2 = L;
      return String.prototype.startsWith ? b2.startsWith(a2) : b2.indexOf(a2) === 0;
    }
    function Ba() {
      return Aa("data:application/octet-stream;base64,");
    }
    var L = "blosc_codec.wasm";
    if (!Ba()) {
      var Ca = L;
      L = f2.locateFile ? f2.locateFile(Ca, "") : "" + Ca;
    }
    function Da() {
      try {
        if (v2)
          return new Uint8Array(v2);
        throw "both async and sync fetching of the wasm failed";
      } catch (a2) {
        w2(a2);
      }
    }
    function N2(a2) {
      for (; 0 < a2.length; ) {
        var b2 = a2.shift();
        if (typeof b2 == "function")
          b2(f2);
        else {
          var c2 = b2.T;
          typeof c2 === "number" ? b2.O === void 0 ? I2.get(c2)() : I2.get(c2)(b2.O) : c2(b2.O === void 0 ? null : b2.O);
        }
      }
    }
    function Ea(a2) {
      this.N = a2 - 16;
      this.$ = function(b2) {
        D[this.N + 8 >> 2] = b2;
      };
      this.X = function(b2) {
        D[this.N + 0 >> 2] = b2;
      };
      this.Y = function() {
        D[this.N + 4 >> 2] = 0;
      };
      this.W = function() {
        F[this.N + 12 >> 0] = 0;
      };
      this.Z = function() {
        F[this.N + 13 >> 0] = 0;
      };
      this.V = function(b2, c2) {
        this.$(b2);
        this.X(c2);
        this.Y();
        this.W();
        this.Z();
      };
    }
    function Fa(a2) {
      switch (a2) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + a2);
      }
    }
    var Ga = void 0;
    function P2(a2) {
      for (var b2 = ""; z2[a2]; )
        b2 += Ga[z2[a2++]];
      return b2;
    }
    var Q = {}, R = {}, S = {};
    function Ha(a2) {
      if (a2 === void 0)
        return "_unknown";
      a2 = a2.replace(/[^a-zA-Z0-9_]/g, "$");
      var b2 = a2.charCodeAt(0);
      return 48 <= b2 && 57 >= b2 ? "_" + a2 : a2;
    }
    function Ia(a2, b2) {
      a2 = Ha(a2);
      return new Function("body", "return function " + a2 + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n')(b2);
    }
    function Ja(a2) {
      var b2 = Error, c2 = Ia(a2, function(d2) {
        this.name = a2;
        this.message = d2;
        d2 = Error(d2).stack;
        d2 !== void 0 && (this.stack = this.toString() + "\n" + d2.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      c2.prototype = Object.create(b2.prototype);
      c2.prototype.constructor = c2;
      c2.prototype.toString = function() {
        return this.message === void 0 ? this.name : this.name + ": " + this.message;
      };
      return c2;
    }
    var Ka = void 0;
    function T2(a2) {
      throw new Ka(a2);
    }
    var La = void 0;
    function Ma(a2, b2) {
      function c2(h2) {
        h2 = b2(h2);
        if (h2.length !== d2.length)
          throw new La("Mismatched type converter count");
        for (var l2 = 0; l2 < d2.length; ++l2)
          U(d2[l2], h2[l2]);
      }
      var d2 = [];
      d2.forEach(function(h2) {
        S[h2] = a2;
      });
      var e2 = Array(a2.length), g2 = [], k2 = 0;
      a2.forEach(function(h2, l2) {
        R.hasOwnProperty(h2) ? e2[l2] = R[h2] : (g2.push(h2), Q.hasOwnProperty(h2) || (Q[h2] = []), Q[h2].push(function() {
          e2[l2] = R[h2];
          ++k2;
          k2 === g2.length && c2(e2);
        }));
      });
      g2.length === 0 && c2(e2);
    }
    function U(a2, b2, c2) {
      c2 = c2 || {};
      if (!("argPackAdvance" in b2))
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var d2 = b2.name;
      a2 || T2('type "' + d2 + '" must have a positive integer typeid pointer');
      if (R.hasOwnProperty(a2)) {
        if (c2.U)
          return;
        T2("Cannot register type '" + d2 + "' twice");
      }
      R[a2] = b2;
      delete S[a2];
      Q.hasOwnProperty(a2) && (b2 = Q[a2], delete Q[a2], b2.forEach(function(e2) {
        e2();
      }));
    }
    var Na = [], V2 = [{}, {value: void 0}, {value: null}, {value: true}, {value: false}];
    function Qa(a2) {
      4 < a2 && --V2[a2].P === 0 && (V2[a2] = void 0, Na.push(a2));
    }
    function Ra(a2) {
      switch (a2) {
        case void 0:
          return 1;
        case null:
          return 2;
        case true:
          return 3;
        case false:
          return 4;
        default:
          var b2 = Na.length ? Na.pop() : V2.length;
          V2[b2] = {P: 1, value: a2};
          return b2;
      }
    }
    function Sa(a2) {
      return this.fromWireType(G2[a2 >> 2]);
    }
    function Ta(a2) {
      if (a2 === null)
        return "null";
      var b2 = typeof a2;
      return b2 === "object" || b2 === "array" || b2 === "function" ? a2.toString() : "" + a2;
    }
    function Ua(a2, b2) {
      switch (b2) {
        case 2:
          return function(c2) {
            return this.fromWireType(qa[c2 >> 2]);
          };
        case 3:
          return function(c2) {
            return this.fromWireType(ra[c2 >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + a2);
      }
    }
    function Va(a2) {
      var b2 = Function;
      if (!(b2 instanceof Function))
        throw new TypeError("new_ called with constructor type " + typeof b2 + " which is not a function");
      var c2 = Ia(b2.name || "unknownFunctionName", function() {
      });
      c2.prototype = b2.prototype;
      c2 = new c2();
      a2 = b2.apply(c2, a2);
      return a2 instanceof Object ? a2 : c2;
    }
    function Wa(a2) {
      for (; a2.length; ) {
        var b2 = a2.pop();
        a2.pop()(b2);
      }
    }
    function Xa(a2, b2) {
      var c2 = f2;
      if (c2[a2].L === void 0) {
        var d2 = c2[a2];
        c2[a2] = function() {
          c2[a2].L.hasOwnProperty(arguments.length) || T2("Function '" + b2 + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + c2[a2].L + ")!");
          return c2[a2].L[arguments.length].apply(this, arguments);
        };
        c2[a2].L = [];
        c2[a2].L[d2.S] = d2;
      }
    }
    function Ya(a2, b2, c2) {
      f2.hasOwnProperty(a2) ? ((c2 === void 0 || f2[a2].L !== void 0 && f2[a2].L[c2] !== void 0) && T2("Cannot register public name '" + a2 + "' twice"), Xa(a2, a2), f2.hasOwnProperty(c2) && T2("Cannot register multiple overloads of a function with the same number of arguments (" + c2 + ")!"), f2[a2].L[c2] = b2) : (f2[a2] = b2, c2 !== void 0 && (f2[a2].ba = c2));
    }
    function Za(a2, b2) {
      for (var c2 = [], d2 = 0; d2 < a2; d2++)
        c2.push(D[(b2 >> 2) + d2]);
      return c2;
    }
    function $a(a2, b2) {
      0 <= a2.indexOf("j") || w2("Assertion failed: getDynCaller should only be called with i64 sigs");
      var c2 = [];
      return function() {
        c2.length = arguments.length;
        for (var d2 = 0; d2 < arguments.length; d2++)
          c2[d2] = arguments[d2];
        var e2;
        a2.indexOf("j") != -1 ? e2 = c2 && c2.length ? f2["dynCall_" + a2].apply(null, [b2].concat(c2)) : f2["dynCall_" + a2].call(null, b2) : e2 = I2.get(b2).apply(null, c2);
        return e2;
      };
    }
    function ab(a2, b2) {
      a2 = P2(a2);
      var c2 = a2.indexOf("j") != -1 ? $a(a2, b2) : I2.get(b2);
      typeof c2 !== "function" && T2("unknown function pointer with signature " + a2 + ": " + b2);
      return c2;
    }
    var bb = void 0;
    function cb(a2) {
      a2 = db(a2);
      var b2 = P2(a2);
      W(a2);
      return b2;
    }
    function eb(a2, b2) {
      function c2(g2) {
        e2[g2] || R[g2] || (S[g2] ? S[g2].forEach(c2) : (d2.push(g2), e2[g2] = true));
      }
      var d2 = [], e2 = {};
      b2.forEach(c2);
      throw new bb(a2 + ": " + d2.map(cb).join([", "]));
    }
    function fb(a2, b2, c2) {
      switch (b2) {
        case 0:
          return c2 ? function(d2) {
            return F[d2];
          } : function(d2) {
            return z2[d2];
          };
        case 1:
          return c2 ? function(d2) {
            return C2[d2 >> 1];
          } : function(d2) {
            return A2[d2 >> 1];
          };
        case 2:
          return c2 ? function(d2) {
            return D[d2 >> 2];
          } : function(d2) {
            return G2[d2 >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + a2);
      }
    }
    var gb = {};
    function hb() {
      if (!ib) {
        var a2 = {USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ca || "./this.program"}, b2;
        for (b2 in gb)
          a2[b2] = gb[b2];
        var c2 = [];
        for (b2 in a2)
          c2.push(b2 + "=" + a2[b2]);
        ib = c2;
      }
      return ib;
    }
    for (var ib, jb = [null, [], []], kb = Array(256), X = 0; 256 > X; ++X)
      kb[X] = String.fromCharCode(X);
    Ga = kb;
    Ka = f2.BindingError = Ja("BindingError");
    La = f2.InternalError = Ja("InternalError");
    f2.count_emval_handles = function() {
      for (var a2 = 0, b2 = 5; b2 < V2.length; ++b2)
        V2[b2] !== void 0 && ++a2;
      return a2;
    };
    f2.get_first_emval = function() {
      for (var a2 = 5; a2 < V2.length; ++a2)
        if (V2[a2] !== void 0)
          return V2[a2];
      return null;
    };
    bb = f2.UnboundTypeError = Ja("UnboundTypeError");
    va.push({T: function() {
      lb();
    }});
    var mb = {p: function(a2) {
      return Y(a2 + 16) + 16;
    }, o: function(a2, b2, c2) {
      new Ea(a2).V(b2, c2);
      throw a2;
    }, z: function(a2, b2, c2, d2, e2) {
      var g2 = Fa(c2);
      b2 = P2(b2);
      U(a2, {name: b2, fromWireType: function(k2) {
        return !!k2;
      }, toWireType: function(k2, h2) {
        return h2 ? d2 : e2;
      }, argPackAdvance: 8, readValueFromPointer: function(k2) {
        if (c2 === 1)
          var h2 = F;
        else if (c2 === 2)
          h2 = C2;
        else if (c2 === 4)
          h2 = D;
        else
          throw new TypeError("Unknown boolean type size: " + b2);
        return this.fromWireType(h2[k2 >> g2]);
      }, M: null});
    }, y: function(a2, b2) {
      b2 = P2(b2);
      U(a2, {name: b2, fromWireType: function(c2) {
        var d2 = V2[c2].value;
        Qa(c2);
        return d2;
      }, toWireType: function(c2, d2) {
        return Ra(d2);
      }, argPackAdvance: 8, readValueFromPointer: Sa, M: null});
    }, h: function(a2, b2, c2) {
      c2 = Fa(c2);
      b2 = P2(b2);
      U(a2, {name: b2, fromWireType: function(d2) {
        return d2;
      }, toWireType: function(d2, e2) {
        if (typeof e2 !== "number" && typeof e2 !== "boolean")
          throw new TypeError('Cannot convert "' + Ta(e2) + '" to ' + this.name);
        return e2;
      }, argPackAdvance: 8, readValueFromPointer: Ua(b2, c2), M: null});
    }, e: function(a2, b2, c2, d2, e2, g2) {
      var k2 = Za(b2, c2);
      a2 = P2(a2);
      e2 = ab(d2, e2);
      Ya(a2, function() {
        eb("Cannot call " + a2 + " due to unbound types", k2);
      }, b2 - 1);
      Ma(k2, function(h2) {
        var l2 = a2, n2 = a2;
        h2 = [h2[0], null].concat(h2.slice(1));
        var p2 = e2, q2 = h2.length;
        2 > q2 && T2("argTypes array size mismatch! Must at least get return value and 'this' types!");
        for (var x = h2[1] !== null && false, B2 = false, m2 = 1; m2 < h2.length; ++m2)
          if (h2[m2] !== null && h2[m2].M === void 0) {
            B2 = true;
            break;
          }
        var Oa = h2[0].name !== "void", H2 = "", M2 = "";
        for (m2 = 0; m2 < q2 - 2; ++m2)
          H2 += (m2 !== 0 ? ", " : "") + "arg" + m2, M2 += (m2 !== 0 ? ", " : "") + "arg" + m2 + "Wired";
        n2 = "return function " + Ha(n2) + "(" + H2 + ") {\nif (arguments.length !== " + (q2 - 2) + ") {\nthrowBindingError('function " + n2 + " called with ' + arguments.length + ' arguments, expected " + (q2 - 2) + " args!');\n}\n";
        B2 && (n2 += "var destructors = [];\n");
        var Pa = B2 ? "destructors" : "null";
        H2 = "throwBindingError invoker fn runDestructors retType classParam".split(" ");
        p2 = [T2, p2, g2, Wa, h2[0], h2[1]];
        x && (n2 += "var thisWired = classParam.toWireType(" + Pa + ", this);\n");
        for (m2 = 0; m2 < q2 - 2; ++m2)
          n2 += "var arg" + m2 + "Wired = argType" + m2 + ".toWireType(" + Pa + ", arg" + m2 + "); // " + h2[m2 + 2].name + "\n", H2.push("argType" + m2), p2.push(h2[m2 + 2]);
        x && (M2 = "thisWired" + (0 < M2.length ? ", " : "") + M2);
        n2 += (Oa ? "var rv = " : "") + "invoker(fn" + (0 < M2.length ? ", " : "") + M2 + ");\n";
        if (B2)
          n2 += "runDestructors(destructors);\n";
        else
          for (m2 = x ? 1 : 2; m2 < h2.length; ++m2)
            q2 = m2 === 1 ? "thisWired" : "arg" + (m2 - 2) + "Wired", h2[m2].M !== null && (n2 += q2 + "_dtor(" + q2 + "); // " + h2[m2].name + "\n", H2.push(q2 + "_dtor"), p2.push(h2[m2].M));
        Oa && (n2 += "var ret = retType.fromWireType(rv);\nreturn ret;\n");
        H2.push(n2 + "}\n");
        h2 = Va(H2).apply(null, p2);
        m2 = b2 - 1;
        if (!f2.hasOwnProperty(l2))
          throw new La("Replacing nonexistant public symbol");
        f2[l2].L !== void 0 && m2 !== void 0 ? f2[l2].L[m2] = h2 : (f2[l2] = h2, f2[l2].S = m2);
        return [];
      });
    }, c: function(a2, b2, c2, d2, e2) {
      function g2(n2) {
        return n2;
      }
      b2 = P2(b2);
      e2 === -1 && (e2 = 4294967295);
      var k2 = Fa(c2);
      if (d2 === 0) {
        var h2 = 32 - 8 * c2;
        g2 = function(n2) {
          return n2 << h2 >>> h2;
        };
      }
      var l2 = b2.indexOf("unsigned") != -1;
      U(a2, {name: b2, fromWireType: g2, toWireType: function(n2, p2) {
        if (typeof p2 !== "number" && typeof p2 !== "boolean")
          throw new TypeError('Cannot convert "' + Ta(p2) + '" to ' + this.name);
        if (p2 < d2 || p2 > e2)
          throw new TypeError('Passing a number "' + Ta(p2) + '" from JS side to C/C++ side to an argument of type "' + b2 + '", which is outside the valid range [' + d2 + ", " + e2 + "]!");
        return l2 ? p2 >>> 0 : p2 | 0;
      }, argPackAdvance: 8, readValueFromPointer: fb(b2, k2, d2 !== 0), M: null});
    }, b: function(a2, b2, c2) {
      function d2(g2) {
        g2 >>= 2;
        var k2 = G2;
        return new e2(E, k2[g2 + 1], k2[g2]);
      }
      var e2 = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][b2];
      c2 = P2(c2);
      U(a2, {name: c2, fromWireType: d2, argPackAdvance: 8, readValueFromPointer: d2}, {U: true});
    }, i: function(a2, b2) {
      b2 = P2(b2);
      var c2 = b2 === "std::string";
      U(a2, {name: b2, fromWireType: function(d2) {
        var e2 = G2[d2 >> 2];
        if (c2)
          for (var g2 = d2 + 4, k2 = 0; k2 <= e2; ++k2) {
            var h2 = d2 + 4 + k2;
            if (k2 == e2 || z2[h2] == 0) {
              g2 = g2 ? ha(z2, g2, h2 - g2) : "";
              if (l2 === void 0)
                var l2 = g2;
              else
                l2 += String.fromCharCode(0), l2 += g2;
              g2 = h2 + 1;
            }
          }
        else {
          l2 = Array(e2);
          for (k2 = 0; k2 < e2; ++k2)
            l2[k2] = String.fromCharCode(z2[d2 + 4 + k2]);
          l2 = l2.join("");
        }
        W(d2);
        return l2;
      }, toWireType: function(d2, e2) {
        e2 instanceof ArrayBuffer && (e2 = new Uint8Array(e2));
        var g2 = typeof e2 === "string";
        g2 || e2 instanceof Uint8Array || e2 instanceof Uint8ClampedArray || e2 instanceof Int8Array || T2("Cannot pass non-string to std::string");
        var k2 = (c2 && g2 ? function() {
          for (var n2 = 0, p2 = 0; p2 < e2.length; ++p2) {
            var q2 = e2.charCodeAt(p2);
            55296 <= q2 && 57343 >= q2 && (q2 = 65536 + ((q2 & 1023) << 10) | e2.charCodeAt(++p2) & 1023);
            127 >= q2 ? ++n2 : n2 = 2047 >= q2 ? n2 + 2 : 65535 >= q2 ? n2 + 3 : n2 + 4;
          }
          return n2;
        } : function() {
          return e2.length;
        })(), h2 = Y(4 + k2 + 1);
        G2[h2 >> 2] = k2;
        if (c2 && g2)
          ia(e2, h2 + 4, k2 + 1);
        else if (g2)
          for (g2 = 0; g2 < k2; ++g2) {
            var l2 = e2.charCodeAt(g2);
            255 < l2 && (W(h2), T2("String has UTF-16 code units that do not fit in 8 bits"));
            z2[h2 + 4 + g2] = l2;
          }
        else
          for (g2 = 0; g2 < k2; ++g2)
            z2[h2 + 4 + g2] = e2[g2];
        d2 !== null && d2.push(W, h2);
        return h2;
      }, argPackAdvance: 8, readValueFromPointer: Sa, M: function(d2) {
        W(d2);
      }});
    }, d: function(a2, b2, c2) {
      c2 = P2(c2);
      if (b2 === 2) {
        var d2 = ka;
        var e2 = la;
        var g2 = ma;
        var k2 = function() {
          return A2;
        };
        var h2 = 1;
      } else
        b2 === 4 && (d2 = na, e2 = oa, g2 = pa, k2 = function() {
          return G2;
        }, h2 = 2);
      U(a2, {name: c2, fromWireType: function(l2) {
        for (var n2 = G2[l2 >> 2], p2 = k2(), q2, x = l2 + 4, B2 = 0; B2 <= n2; ++B2) {
          var m2 = l2 + 4 + B2 * b2;
          if (B2 == n2 || p2[m2 >> h2] == 0)
            x = d2(x, m2 - x), q2 === void 0 ? q2 = x : (q2 += String.fromCharCode(0), q2 += x), x = m2 + b2;
        }
        W(l2);
        return q2;
      }, toWireType: function(l2, n2) {
        typeof n2 !== "string" && T2("Cannot pass non-string to C++ string type " + c2);
        var p2 = g2(n2), q2 = Y(4 + p2 + b2);
        G2[q2 >> 2] = p2 >> h2;
        e2(n2, q2 + 4, p2 + b2);
        l2 !== null && l2.push(W, q2);
        return q2;
      }, argPackAdvance: 8, readValueFromPointer: Sa, M: function(l2) {
        W(l2);
      }});
    }, A: function(a2, b2) {
      b2 = P2(b2);
      U(a2, {
        aa: true,
        name: b2,
        argPackAdvance: 0,
        fromWireType: function() {
        },
        toWireType: function() {
        }
      });
    }, n: Qa, x: function(a2) {
      4 < a2 && (V2[a2].P += 1);
    }, C: function(a2, b2) {
      var c2 = R[a2];
      c2 === void 0 && T2("_emval_take_value has unknown type " + cb(a2));
      a2 = c2.readValueFromPointer(b2);
      return Ra(a2);
    }, t: function() {
      w2();
    }, r: function(a2, b2, c2) {
      z2.copyWithin(a2, b2, b2 + c2);
    }, s: function(a2) {
      a2 >>>= 0;
      var b2 = z2.length;
      if (2147483648 < a2)
        return false;
      for (var c2 = 1; 4 >= c2; c2 *= 2) {
        var d2 = b2 * (1 + 0.2 / c2);
        d2 = Math.min(d2, a2 + 100663296);
        d2 = Math.max(16777216, a2, d2);
        0 < d2 % 65536 && (d2 += 65536 - d2 % 65536);
        a: {
          try {
            y.grow(Math.min(2147483648, d2) - E.byteLength + 65535 >>> 16);
            sa(y.buffer);
            var e2 = 1;
            break a;
          } catch (g2) {
          }
          e2 = void 0;
        }
        if (e2)
          return true;
      }
      return false;
    }, u: function(a2, b2) {
      var c2 = 0;
      hb().forEach(function(d2, e2) {
        var g2 = b2 + c2;
        e2 = D[a2 + 4 * e2 >> 2] = g2;
        for (g2 = 0; g2 < d2.length; ++g2)
          F[e2++ >> 0] = d2.charCodeAt(g2);
        F[e2 >> 0] = 0;
        c2 += d2.length + 1;
      });
      return 0;
    }, v: function(a2, b2) {
      var c2 = hb();
      D[a2 >> 2] = c2.length;
      var d2 = 0;
      c2.forEach(function(e2) {
        d2 += e2.length + 1;
      });
      D[b2 >> 2] = d2;
      return 0;
    }, w: function() {
      return 0;
    }, q: function() {
    }, g: function(a2, b2, c2, d2) {
      for (var e2 = 0, g2 = 0; g2 < c2; g2++) {
        for (var k2 = D[b2 + 8 * g2 >> 2], h2 = D[b2 + (8 * g2 + 4) >> 2], l2 = 0; l2 < h2; l2++) {
          var n2 = z2[k2 + l2], p2 = jb[a2];
          n2 === 0 || n2 === 10 ? ((a2 === 1 ? da : u2)(ha(p2, 0)), p2.length = 0) : p2.push(n2);
        }
        e2 += h2;
      }
      D[d2 >> 2] = e2;
      return 0;
    }, a: y, l: function() {
      return 0;
    }, k: function() {
      return 0;
    }, j: function() {
    }, B: function() {
      return 6;
    }, m: function() {
    }, f: function() {
    }};
    (function() {
      function a2(e2) {
        f2.asm = e2.exports;
        I2 = f2.asm.D;
        J--;
        f2.monitorRunDependencies && f2.monitorRunDependencies(J);
        J == 0 && (K2 && (e2 = K2, K2 = null, e2()));
      }
      function b2(e2) {
        a2(e2.instance);
      }
      function c2(e2) {
        return Promise.resolve().then(Da).then(function(g2) {
          return WebAssembly.instantiate(g2, d2);
        }).then(e2, function(g2) {
          u2("failed to asynchronously prepare wasm: " + g2);
          w2(g2);
        });
      }
      var d2 = {a: mb};
      J++;
      f2.monitorRunDependencies && f2.monitorRunDependencies(J);
      if (f2.instantiateWasm)
        try {
          return f2.instantiateWasm(d2, a2);
        } catch (e2) {
          return u2("Module.instantiateWasm callback failed with error: " + e2), false;
        }
      (function() {
        return v2 || typeof WebAssembly.instantiateStreaming !== "function" || Ba() || Aa("file://") || typeof fetch !== "function" ? c2(b2) : fetch(L, {credentials: "same-origin"}).then(function(e2) {
          return WebAssembly.instantiateStreaming(e2, d2).then(b2, function(g2) {
            u2("wasm streaming compile failed: " + g2);
            u2("falling back to ArrayBuffer instantiation");
            return c2(b2);
          });
        });
      })().catch(ba);
      return {};
    })();
    var lb = f2.___wasm_call_ctors = function() {
      return (lb = f2.___wasm_call_ctors = f2.asm.E).apply(null, arguments);
    }, Y = f2._malloc = function() {
      return (Y = f2._malloc = f2.asm.F).apply(null, arguments);
    }, W = f2._free = function() {
      return (W = f2._free = f2.asm.G).apply(null, arguments);
    }, db = f2.___getTypeName = function() {
      return (db = f2.___getTypeName = f2.asm.H).apply(null, arguments);
    };
    f2.___embind_register_native_and_builtin_types = function() {
      return (f2.___embind_register_native_and_builtin_types = f2.asm.I).apply(null, arguments);
    };
    f2.dynCall_jiiiii = function() {
      return (f2.dynCall_jiiiii = f2.asm.J).apply(null, arguments);
    };
    f2.dynCall_jiji = function() {
      return (f2.dynCall_jiji = f2.asm.K).apply(null, arguments);
    };
    var Z2;
    K2 = function nb() {
      Z2 || ob();
      Z2 || (K2 = nb);
    };
    function ob() {
      function a2() {
        if (!Z2 && (Z2 = true, f2.calledRun = true, !ea)) {
          N2(va);
          N2(wa);
          aa(f2);
          if (f2.onRuntimeInitialized)
            f2.onRuntimeInitialized();
          if (f2.postRun)
            for (typeof f2.postRun == "function" && (f2.postRun = [f2.postRun]); f2.postRun.length; ) {
              var b2 = f2.postRun.shift();
              xa.unshift(b2);
            }
          N2(xa);
        }
      }
      if (!(0 < J)) {
        if (f2.preRun)
          for (typeof f2.preRun == "function" && (f2.preRun = [f2.preRun]); f2.preRun.length; )
            ya();
        N2(ua);
        0 < J || (f2.setStatus ? (f2.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
            f2.setStatus("");
          }, 1);
          a2();
        }, 1)) : a2());
      }
    }
    f2.run = ob;
    if (f2.preInit)
      for (typeof f2.preInit == "function" && (f2.preInit = [f2.preInit]); 0 < f2.preInit.length; )
        f2.preInit.pop()();
    ob();
    return blosc_codec2.ready;
  };
}();
var wasmSrc = "AGFzbQEAAAABwAImYAF/AX9gA39/fwF/YAV/f39/fwF/YAJ/fwF/YAJ/fwBgAX8AYAN/f38AYAR/f39/AX9gBH9/f38AYAAAYAZ/f39/f38Bf2AFf39/f38AYAZ/f39/f38AYAd/f39/f39/AX9gBH9/f38BfmAFf39/f38BfmAIf39/f39/f38Bf2AJf39/f39/f39/AX9gAn5/AX9gC39/f39/f39/f39/AX9gA39+fwF+YAN/f34AYAN/f34Bf2ADfn9/AX9gAn5+AX5gCH9/f39/f39/AGAJf39/f39/f39/AGAFf35/f38AYAABf2ANf39/f39/f39/f39/fwF/YA9/f39/f39/f39/f39/f38Bf2AFf39/fn8Bf2AGf3x/f39/AX9gAX8BfmACf38BfmAHf35/f39/fwF+YAF+AX5gBH5/f34BfgK0AR0BYQFiAAYBYQFjAAsBYQFkAAYBYQFlAAwBYQFmAAUBYQFnAAcBYQFoAAYBYQFpAAQBYQFqAAMBYQFrAAABYQFsAAABYQFtAAMBYQFuAAUBYQFvAAYBYQFwAAABYQFxAAIBYQFyAAEBYQFzAAABYQF0AAkBYQF1AAMBYQF2AAMBYQF3AAABYQF4AAUBYQF5AAQBYQF6AAsBYQFBAAQBYQFCAAcBYQFDAAMBYQFhAgGAAoCAAgOtBKsEBAEBAwIACAAAAAQHAQEBAAIBAAQDAQMBBAEFAwUFAAYAAwAIAgIDAQgBAwYBCwEBAAQYBAEEBwoGAwMLBwgBBggDCwUDAwMGCAEGBAYABwIGAAABAAIEBAYEBQMDAAsABgwDAAANBgIYAwkAAQwGBggAAgAAAAUQHQAEAQMbBwcHBwMDBh4TBAgBAgECCgcGCgYEAAQAARARAwAIAAYDBgAFBQUFBQUJCwUGAQAFBQICAgcHAwQEAAcSARIXJQQGAwMDAAUEAQABBQUDAAMGCgAFBQMBHwUDAwUFAREDBwoEAAUBAwcKCiEGBQEABgYGBQUIAxMNAAADAAkBBwcHBwcHBwcAAQgGBwMRAgICAgYCCAoCAgcCCAAFBAUFAAMAAAIKBBQACQwMCwMLCAgICwwAAQEFAAUABQkDAAMSEhcGAQAUAAAJCQkJBgAJCQkJCQkJCQkJCQkJDQ0ABgcBAQcHAgEBAgEEAwoABAcFBRwKCgoFAgoCAgMaGQUE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BCAGanQgAWohASACIARHIQwgBEEBaiEEIAwNAAsLIA1BAWoiDSACayIBIAcgAWtBAWoiCEkEQCAKQQJJIQYDQEEBIQQgBkUEQANAIARBAnQiCiADIAFBNGxqaiADIApqKAIAIAF2NgIAIAIgBEchCiAEQQFqIQQgCg0ACwsgAUEBaiIBIAhJDQALCyAAQQRqIAcgCyAJIANBpAVqIAMgAiANEJYDIAVBAToABSAFIAc6AAYgACAFKAIENgIACyAQIQQLIAVBEGokACAEC+ACAQl/IwBBEGsiBCQAIARBADYCDCAEQQA2AggCQCADQUBrIgkgAyAEQQhqIARBDGogASACEPsBIggQIQ0AIARBBGogACgCABA0QQEhASAEKAIMIgUgBC0ABEEBak0EQEEAIQIgBEEAOgAFIAQgBToABiAAIAQoAgQ2AgAgBUEBakEBSwRAA0AgAyABQQJ0aiIGKAIAIQcgBiACNgIAIAcgAUF/anQgAmohAiABIAVGIQYgAUEBaiEBIAZFDQALCyAEKAIIIgdFDQEgAEEEaiEKIAVBAWohC0EAIQADQCADIAAgCWotAAAiBUECdGoiBigCACIBIAFBASAFdEEBdSIMaiICSQRAIAsgBWshBQNAIAogAUEBdGoiAiAFOgABIAIgADoAACABQQFqIgEgBigCACAMaiICSQ0ACwsgBiACNgIAIABBAWoiACAHRw0ACwwBC0FUIQgLIARBEGokACAICxQAIAAoAABBgPqerQNsQSAgAWt2CygAAkACQAJAIAAoAowBQX9qDgIAAQILIAAgARDCAw8LIAAgARDHAwsLOgEBfyABIAAoAgRrIgEgACgCGCICQYAIaksEQCAAIAEgASACa0GAeGoiAEGABCAAQYAESRtrNgIYCwsVACAAEJEBBEAgACgCBA8LIAAtAAsLRQEBfwJAIAIgA00gACABTXINAANAIABBf2oiAC0AACACQX9qIgItAABHDQEgBEEBaiEEIAIgA00NASAAIAFLDQALCyAECwwAIABBICABa62IpwsQACAAIAEgAigCCHRBA3RqCxIAIABBwAAgAWutiKdBACABGwsvAEEgIAFrIgEgAkkEQCAAp0F/IAJ0QX9zcQ8LIAAgASACa62Ip0F/IAJ0QX9zcQsgACACrSAAIAGtQgp8IAN+fULjyJW9y5vvjU9+fEIK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nn9+QuPcypX8zvL1hX98IQYgBCIDIgFBCGoiBCACTQ0ACwsCQCADQQRqIgEgAksEQCADIQEMAQsgAygAAK1Ch5Wvr5i23puef34gBoVCF4lCz9bTvtLHq9lCfkL5893xmfaZqxZ8IQYLIAEgAkkEQCAAIAVqQShqIQADQCABMQAAQsXP2bLx5brqJ34gBoVCC4lCh5Wvr5i23puef34hBiABQQFqIgEgAEcNAAsLIAZCIYggBoVCz9bTvtLHq9lCfiIGQh2IIAaFQvnz3fGZ9pmrFn4iBkIgiCAGhQv4AgICfwR+IAAgACkDACACrXw3AwACQAJAIAAoAkgiAyACakEfTQRAIAAgA2pBKGogASACEKsBIAAoAkggAmohAQwBCyABIAJqIQQCQAJ/IAMEQCAAQShqIgIgA2ogAUEgIANrEKsBIAAgACkDCCACKQAAEE43AwggACAAKQMQIAApADAQTjcDECAAIAApAxggACkAOBBONwMYIAAgACkDICAAQUBrKQAAEE43AyAgACgCSCECIABBADYCSCABIAJrQSBqIQELIAFBIGogBEsLBEAgASECDAELIARBYGohAyAAKQMgIQUgACkDGCEGIAApAxAhByAAKQMIIQgDQCAIIAEpAAAQTiEIIAcgASkACBBOIQcgBiABKQAQEE4hBiAFIAEpABgQTiEFIAFBIGoiAiEBIAIgA00NAAsgACAFNwMgIAAgBjcDGCAAIAc3AxAgACAINwMICyACIARPDQEgAEEoaiACIAQgAmsiARCrAQsgACABNgJICwtlACAAQgA3AyggAEL56tDQ58mh5OEANwMgIABCADcDGCAAQs/W077Sx6vZQjcDECAAQtbrgu7q/Yn14AA3AwggAEIANwMAIABCADcDMCAAQgA3AzggAEFAa0IANwMAIABCADcDSAsVACABBEAgAiAAIAERAwAPCyAAEEwLYQEDf0F+IQECQCAARQ0AIAAoAhwiAkUNACAAKAIkIgNFDQAgAigCNCIBBEAgACgCKCABIAMRBAAgACgCJCEDIAAoAhwhAgsgACgCKCACIAMRBABBACEBIABBADYCHAsgAQudCwEMfyACQQBOBEBBBEEDIAEvAQIiCxshB0EHQYoBIAsbIQQgAEG5LWohCEF/IQYDQCALIQkCQCAJIAEgDCINQQFqIgxBAnRqLwECIgtHIAVBAWoiAyAETnJFBEAgAyEFDAELAkAgAyAHSARAIAAgCUECdGoiBUH8FGohByAFQf4UaiEKIAAvAbgtIQQgACgCvC0hBQNAIAovAQAhBiAAIAQgBy8BACIOIAV0ciIEOwG4LSAAAn8gBUEQIAZrSgRAIAAgACgCFCIFQQFqNgIUIAUgACgCCGogBDoAACAAIAAoAhQiBUEBajYCFCAFIAAoAghqIAgtAAA6AAAgACAOQRAgACgCvC0iBWt2IgQ7AbgtIAUgBmpBcGoMAQsgBSAGagsiBTYCvC0gA0F/aiIDDQALDAELIAACfyAJBEACQCAGIAlGBEAgAC8BuC0hByAAKAK8LSEEIAMhBQwBCyAAIAlBAnRqIgZB/hRqLwEAIQMgACAALwG4LSAGQfwUai8BACIKIAAoArwtIgZ0ciIHOwG4LQJAIAZBECADa0oEQCAAIAAoAhQiBkEBajYCFCAGIAAoAghqIAc6AAAgACAAKAIUIgZBAWo2AhQgBiAAKAIIaiAILQAAOgAAIAMgACgCvC0iBmpBcGohBCAKQRAgBmt2IQcMAQsgAyAGaiEECyAAIAQ2ArwtCyAHIAAvAbwVIgYgBHRyIQcCQCAEQRAgAC8BvhUiA2tKBEAgACAHOwG4LSAAIAAoAhQiBEEBajYCFCAEIAAoAghqIAc6AAAgACAAKAIUIgRBAWo2AhQgBCAAKAIIaiAILQAAOgAAIAMgACgCvC0iB2pBcGohBCAGQRAgB2t2IQcMAQsgAyAEaiEECyAAIAQ2ArwtIAAgByAFQf3/A2pB//8DcSIFIAR0ciIDOwG4LSAEQQ9OBEAgACAAKAIUIgZBAWo2AhQgBiAAKAIIaiADOgAAIAAgACgCFCIDQQFqNgIUIAMgACgCCGogCC0AADoAACAAIAVBECAAKAK8LSIFa3Y7AbgtIAVBcmoMAgsgBEECagwBCyAFQQlMBEAgAC8BuC0gAC8BwBUiCiAAKAK8LSIDdHIhBwJAIANBECAALwHCFSIGa0oEQCAAIAc7AbgtIAAgACgCFCIDQQFqNgIUIAMgACgCCGogBzoAACAAIAAoAhQiA0EBajYCFCADIAAoAghqIAgtAAA6AAAgBiAAKAK8LSIDakFwaiEEIApBECADa3YhBwwBCyADIAZqIQQLIAAgBDYCvC0gACAHIAVB/v8DakH//wNxIgUgBHRyIgM7AbgtIARBDk4EQCAAIAAoAhQiBkEBajYCFCAGIAAoAghqIAM6AAAgACAAKAIUIgNBAWo2AhQgAyAAKAIIaiAILQAAOgAAIAAgBUEQIAAoArwtIgVrdjsBuC0gBUFzagwCCyAEQQNqDAELIAAvAbgtIAAvAcQVIgogACgCvC0iA3RyIQcCQCADQRAgAC8BxhUiBmtKBEAgACAHOwG4LSAAIAAoAhQiA0EBajYCFCADIAAoAghqIAc6AAAgACAAKAIUIgNBAWo2AhQgAyAAKAIIaiAILQAAOgAAIAYgACgCvC0iA2pBcGohBCAKQRAgA2t2IQcMAQsgAyAGaiEECyAAIAQ2ArwtIAAgByAFQfb/A2pB//8DcSIFIAR0ciIDOwG4LSAEQQpOBEAgACAAKAIUIgZBAWo2AhQgBiAAKAIIaiADOgAAIAAgACgCFCIDQQFqNgIUIAMgACgCCGogCC0AADoAACAAIAVBECAAKAK8LSIFa3Y7AbgtIAVBd2oMAQsgBEEHags2ArwtC0EAIQUCfyALRQRAQYoBIQRBAwwBC0EGQQcgCSALRiIDGyEEQQNBBCADGwshByAJIQYLIAIgDUcNAAsLC7kCAQx/IAEvAQIhBiACQQJ0IAFqQf//AzsBBiACQQBOBEBBB0GKASAGGyEIQQRBAyAGGyEHIABBwBVqIQsgAEHEFWohDCAAQbwVaiENQX8hCQNAIAYhBAJAIAQgASAKIg5BAWoiCkECdGovAQIiBkcgA0EBaiIFIAhOckUEQCAFIQMMAQsCfyAFIAdIBEAgACAEQQJ0akH8FGoiAy8BACAFagwBCyAEBEAgBCAJRwRAIAAgBEECdGpB/BRqIgMgAy8BAEEBajsBAAsgDSIDLwEAQQFqDAELIANBCUwEQCALIgMvAQBBAWoMAQsgDCIDLwEAQQFqCyEFIAMgBTsBAEEAIQMCfyAGRQRAQQMhB0GKAQwBC0EDQQQgBCAGRiIFGyEHQQZBByAFGwshCCAEIQkLIAIgDkcNAAsLC+EIAQp/AkAgACgCoC1FBEAgAC8BuC0hBSAAKAK8LSEEDAELIABBuS1qIQgDQCADQQFqIQogACgCmC0gA2otAAAhBQJAIAACfyAAKAKkLSADQQF0ai8BACIJRQRAIAEgBUECdGoiBC8BAiEDIAAgAC8BuC0gBC8BACIHIAAoArwtIgR0ciIFOwG4LSAEQRAgA2tKBEAgACAAKAIUIgRBAWo2AhQgBCAAKAIIaiAFOgAAIAAgACgCFCIEQQFqNgIUIAQgACgCCGogCC0AADoAACAAIAdBECAAKAK8LSIEa3YiBTsBuC0gAyAEakFwagwCCyADIARqDAELIAVBoOUAai0AACILQQJ0IgdBgAhyIAFqIgQvAQYhAyAAIAAvAbgtIAQvAQQiDCAAKAK8LSIGdHIiBDsBuC0gAAJ/IAZBECADa0oEQCAAIAAoAhQiBkEBajYCFCAGIAAoAghqIAQ6AAAgACAAKAIUIgRBAWo2AhQgBCAAKAIIaiAILQAAOgAAIAAgDEEQIAAoArwtIgZrdiIEOwG4LSADIAZqQXBqDAELIAMgBmoLIgM2ArwtIAtBeGpBE00EQCAAIAQgBSAHQaDnAGooAgBrQf//A3EiBiADdHIiBDsBuC0gAAJ/IANBECAHQYDkAGooAgAiBWtKBEAgACAAKAIUIgNBAWo2AhQgAyAAKAIIaiAEOgAAIAAgACgCFCIDQQFqNgIUIAMgACgCCGogCC0AADoAACAAIAZBECAAKAK8LSIDa3YiBDsBuC0gAyAFakFwagwBCyADIAVqCyIDNgK8LQsgAiAJQX9qIgcgB0EHdkGAAmogB0GAAkkbQaDoAGotAAAiC0ECdCIJaiIFLwECIQYgACAEIAUvAQAiDCADdHIiBTsBuC0gAAJ/IANBECAGa0oEQCAAIAAoAhQiA0EBajYCFCADIAAoAghqIAU6AAAgACAAKAIUIgNBAWo2AhQgAyAAKAIIaiAILQAAOgAAIAAgDEEQIAAoArwtIgNrdiIFOwG4LSADIAZqQXBqDAELIAMgBmoLIgQ2ArwtIAtBBEkNASAAIAUgByAJQaDsAGooAgBrQf//A3EiByAEdHIiBTsBuC0gBEEQIAlBgNoAaigCACIDa0oEQCAAIAAoAhQiBEEBajYCFCAEIAAoAghqIAU6AAAgACAAKAIUIgRBAWo2AhQgBCAAKAIIaiAILQAAOgAAIAAgB0EQIAAoArwtIgRrdiIFOwG4LSADIARqQXBqDAELIAMgBGoLIgQ2ArwtCyAKIgMgACgCoC1JDQALCyABQYIIai8BACECIAAgBSABLwGACCIBIAR0ciIDOwG4LSAEQRAgAmtKBEAgACAAKAIUIgpBAWo2AhQgCiAAKAIIaiADOgAAIAAgACgCFCIDQQFqNgIUIAMgACgCCGogAEG5LWotAAA6AAAgACABQRAgACgCvC0iAWt2OwG4LSAAIAEgAmpBcGo2ArwtDwsgACACIARqNgK8LQuXAQECfwJAAn8gACgCvC0iAUEJTgRAIAAgACgCFCIBQQFqNgIUIAEgACgCCGogAC0AuC06AAAgACAAKAIUIgFBAWo2AhQgAEG5LWotAAAhAiABIAAoAghqDAELIAFBAUgNASAAIAAoAhQiAUEBajYCFCAALQC4LSECIAEgACgCCGoLIAI6AAALIABBADYCvC0gAEEAOwG4LQvaBAEBfwNAIAAgAUECdGpBADsBlAEgAUEBaiIBQZ4CRw0ACyAAQQA7AfwUIABBADsBiBMgAEHEFWpBADsBACAAQcAVakEAOwEAIABBvBVqQQA7AQAgAEG4FWpBADsBACAAQbQVakEAOwEAIABBsBVqQQA7AQAgAEGsFWpBADsBACAAQagVakEAOwEAIABBpBVqQQA7AQAgAEGgFWpBADsBACAAQZwVakEAOwEAIABBmBVqQQA7AQAgAEGUFWpBADsBACAAQZAVakEAOwEAIABBjBVqQQA7AQAgAEGIFWpBADsBACAAQYQVakEAOwEAIABBgBVqQQA7AQAgAEH8E2pBADsBACAAQfgTakEAOwEAIABB9BNqQQA7AQAgAEHwE2pBADsBACAAQewTakEAOwEAIABB6BNqQQA7AQAgAEHkE2pBADsBACAAQeATakEAOwEAIABB3BNqQQA7AQAgAEHYE2pBADsBACAAQdQTakEAOwEAIABB0BNqQQA7AQAgAEHME2pBADsBACAAQcgTakEAOwEAIABBxBNqQQA7AQAgAEHAE2pBADsBACAAQbwTakEAOwEAIABBuBNqQQA7AQAgAEG0E2pBADsBACAAQbATakEAOwEAIABBrBNqQQA7AQAgAEGoE2pBADsBACAAQaQTakEAOwEAIABBoBNqQQA7AQAgAEGcE2pBADsBACAAQZgTakEAOwEAIABBlBNqQQA7AQAgAEGQE2pBADsBACAAQYwTakEAOwEAIABCADcCrC0gAEGUCWpBATsBACAAQQA2AqgtIABBADYCoC0LngEBAn8gACAALwG4LSADQf//A3EiBCAAKAK8LSIDdHIiBTsBuC0gAAJ/IANB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A0AgCSAFIARBAXRqIgotAAEiC0ECdGoiDCgCACEDIAlBPGogCi0AAEEIdCAIakH//wNxEC8gCUECOgA/IAkgByALayIKIAJqOgA+IANBASABIAprdGohCiAJKAI8IQsDQCAAIANBAnRqIAs2AQAgA0EBaiIDIApJDQALIAwgCjYCACAEQQFqIgQgBkcNAAsLIAlBQGskAAvdAgEJfyMAQdAAayIJJAAgCUFAayAFKAIwNgIAIAkgBSkCKDcDOCAJIAUpAiA3AzAgCSAFKQIYNwMoIAkgBSkCEDcDICAJIAUpAgA3AxAgCSAFKQIINwMYIAMEQCAHIAZrIQ8gByABayEQA0BBASABIAcgAiALQQF0aiIGLQABIgxrIghrIgp0IQ0gBi0AACEOIAlBEGogDEECdGoiDCgCACEGAkAgCiAPTwRAIAAgBkECdGogCiAIIAUgCEE0bGogCCAQaiIIQQEgCEEBShsiCCACIAQgCEECdGooAgAiCEEBdGogAyAIayAHIA4QlQMgBiANaiEIDAELIAlBDGogDhAvIAlBAToADyAJIAg6AA4gBiAGIA1qIghPDQAgCSgCDCEKA0AgACAGQQJ0aiAKNgEAIAZBAWoiBiAIRw0ACwsgDCAINgIAIAtBAWoiCyADRw0ACwsgCUHQAGokAAs+AQN/IAAEQCAAKAIAIABBvNABaigCACIBIABBwNABaigCACICIABBxNABaigCACIDEGQgACABIAIgAxBkCwvMAQEBfyAAIAEoArTQATYCmOIBIAAgASgCBCICNgLA4AEgACACNgK84AEgACACIAEoAghqIgI2ArjgASAAIAI2AsTgASABKAK40AEEQCAAQoGAgIAQNwOI4QEgACABQaTQAGo2AgwgACABQZQgajYCCCAAIAFBnDBqNgIEIAAgAUEMajYCACAAQazQAWogAUGo0AFqKAIANgIAIABBsNABaiABQazQAWooAgA2AgAgAEG00AFqIAFBsNABaigCADYCAA8LIABCADcDiOEBC6JIAS5/IwBB4ABrIhIkACAAKAKEASEGIAAoAgQhByAAKAKIASEFIAAoAgwhCCASIAAoAhg2AlwgACgCPCEbIABBQGsoAgAhHCAAQSxqIiYgAyAEQQIQWSADIAcgCGogA0ZqIg0gAyAEaiIMQXhqIi5JBEAgBUH/HyAFQf8fSRsh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AnRBsKcBaigCABBHIAtBOGoQOSALQThqIAAvAQYgAi0AAEECdEGQpAFqKAIAEEcgC0E4ahA5AkAgCgRAIAEtAAAiASABQRggAUEYSRsiAmsiAQRAIAtBOGogACgCACABEEcgC0E4ahA5CyALQThqIAAoAgAgAXYgAhBHDAELIAtBOGogACgCACABLQAAEEcLIAtBOGoQOSAJQQJPBEAgCUF+aiEMA0AgByAMai0AACECIAMgDGotAAAhBCALQThqIAtBGGogBSAMai0AACIAEGwgC0E4aiALQShqIAQQbCALQThqEDkgC0E4aiALQQhqIAIQbCALQThqEDkgC0E4aiAIIAxBA3RqIgEvAQQgAkECdEGwpwFqKAIAIgIQRyACIARBAnRBkKQBaigCACICakEZTwRAIAtBOGoQOQsgC0E4aiABLwEGIAIQRyALQThqEDkCQCAKBEAgACAAQRggAEEYSRsiAmsiAARAIAtBOGogASgCACAAEEcgC0E4ahA5CyALQThqIAEoAgAgAHYgAhBHDAELIAtBOGogASgCACAAEEcLIAtBOGoQOSAMQX9qIgwgCUkNAAsLIAtBOGogCygCKCALKAI0EHQgC0E4aiALKAIYIAsoAiQQdCALQThqIAsoAgggCygCFBB0IAtBOGoQ/QEiAEG6fyAAGyEMCyALQdAAaiQAIAwLLwAgACACQQN0aigCBCIAQRB2QQFqIgJBCHRBfyABdCAAayACQRB0akEIdCABdmsLTwEEfwNAIANBASAAIARBAnRqKAIAIgNBCHQiBSACbiIGIAUgAkkbIAYgAxtBAnRBkJwBaigCACADbGohAyAEQQFqIgQgAU0NAAsgA0EIdgtKAQF/IwBB8ARrIgQkACAEIAMgAiABEKcBIgMgACACIAEQpgEiAhAhRQRAIARB8ABqQYAEIAQgASADEKgBIQILIARB8ARqJAAgAguKAQEIfyMAQRBrIgMkACADIAAQc0F/IQUCQCAALwACIAJJDQAgAygCDCIHQQh0QYACaiEIIAMoAgghCUEAIQADQCAJIAcgABDJAyEGIAEgAEECdGooAgAiCgRAIAYgCE8NAiAGIApsIARqIQQLIABBAWoiACACTQ0ACyAEQQh2IQULIANBEGokACAFC18BAn9BCCABayEFQQAhAQNAIARBASAAIAFBAXRqLwEAIgQg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ASACEEUiARAhDQEgBEEQaiAEQRhqIAMQggEgBEEIaiAEQRhqIAMQggFBACEBAkAgBEEYahAjBEBBACEDDAELA0AgACABaiICIARBEGogBEEYahBiOgAAIAIgBEEIaiAEQRhqEGI6AAEgBEEYahAjBEAgAUECciEDDAILIAIgBEEQaiAEQRhqEGI6AAIgAiAEQQhqIARBGGoQYjoAAyABQQRqIQMgBEEYahAjIQIgAUH3AUsNASADIQEgAkUNAAsLAn8DQEG6fyEBIANB/QFLDQMgACADaiICIARBEGogBEEYahBiOgAAIAIiBkEBaiEFIARBGGoQI0EDRgRAQQIhAyAEQQhqDAILIANB/AFLDQMgBiAEQQhqIARBGGoQYjoAASADQQJqIQMgBEEYahAjQQNHDQALIAAgA2ohBUEDIQMgBEEQagshASAFIAEgBEEYahBiOgAAIAIgA2ogAGshAQwBCyAEQRhqIAEgAhBFIgEQIQ0AIARBEGogBEEYaiADEIIBIARBCGogBEEYaiADEIIBQQAhAQJAIARBGGoQIwRAQQAhAwwBCwNAIAAgAWoiAiAEQRBqIARBGGoQYToAACACIARBCGogBEEYahBhOgABIARBGGoQIwRAIAFBAnIhAwwCCyACIARBEGogBEEYahBhOgACIAIgBEEIaiAEQRhqEGE6AAMgAUEEaiEDIARBGGoQIyECIAFB9wFLDQEgAyEBIAJFDQALCwJ/A0BBun8hASADQf0BSw0CIAAgA2oiAiAEQRBqIARBGGoQYToAACACIgZBAWohBSAEQRhqECNBA0YEQEECIQMgBEEIagwCCyADQfwBSw0CIAYgBEEIaiAEQRhqEGE6AAEgA0ECaiEDIARBGGoQI0EDRw0ACyAAIANqIQVBAyEDIARBEGoLIQEgBSABIARBGGoQYToAACACIANqIABrIQELIARBMGokACABC68DAQp/IwBBgARrIgkkAEFSIQUCQCACQf8BSw0AIABBBGohCkGAgAQgA0F/anRBEHUhC0EBIAN0IghBf2oiDCEHQQEhBQNAAkAgASAEQQF0Ig1qLwEAIgZB//8DRgRAIAogB0ECdGogBDoAAiAHQX9qIQdBASEGDAELIAVBACALIAZBEHRBEHVKGyEFCyAJIA1qIAY7AQAgAiAERyEGIARBAWohBCAGDQALIAAgBTsB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IAIgASgCCGpBADoAACABIAEoAhQiAkEBajYCFCACIAEoAghqQQA6AABBAiECIAEoAoQBIgNBCUcEQEEEIAEoAogBQQFKQQJ0IANBAkgbIQILIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAjoAACABIAEoAhQiAkEBajYCFCACIAEoAghqQQM6AAAgAUHxADYCBAwNCyACKAIkIQMgAigCHCEEIAIoAhAhBSACKAIsIQYgAigCACEHIAEgASgCFCIIQQFqNgIUQQIhAiAIIAEoAghqIAZBAEdBAXQgB0EAR3IgBUEAR0ECdHIgBEEAR0EDdHIgA0EAR0EEdHI6AAAgASgCHCgCBCEDIAEgASgCFCIEQQFqNgIUIAQgASgCCGogAzoAACABKAIcKAIEIQMgASABKAIUIgRBAWo2AhQgBCABKAIIaiADQQh2OgAAIAEoAhwvAQYhAyABIAEoAhQiBEEBajYCFCAEIAEoAghqIAM6AAAgASgCHC0AByEDIAEgASgCFCIEQQFqNgIUIAQgASgCCGogAzoAACABKAKEASIDQQlHBEBBBCABKAKIAUEBSkECdCADQQJIGyECCyABIAEoAhQiA0EBajYCFCADIAEoAghqIAI6AAAgASgCHCgCDCECIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAjoAAAJ/IAEoAhwiBCgCEARAIAQoAhQhAiABIAEoAhQiA0EBajYCFCADIAEoAghqIAI6AAAgASgCHCgCFCECIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAkEIdjoAACABKAIcIQQLIAQoAiwLBEAgACAAKAIwIAEoAgggASgCFBA1NgIwCyABQcUANgIEIAFBADYCIAwCCyABKAIwQQx0QYCQfmohBEEAIQICQCABKAKIAUEBSg0AIAEoAoQBIgNBAkgNAEHAACECIANBBkgNAEGAAUHAASADQQZGGyECCyABQfEANgIEIAEgAiAEciICQSByIAIgASgCbBsiAkEfcCACckEfcxB1IAEoAmwEQCABIAAvATIQdSABIAAvATAQdQsgAEEAQQBBABBlNgIwIAEoAgQhAgsgAkHFAEcNASABKAIcIQQLAkAgBCgCEARAIAEoAhQhAiABKAIgIgUgBC8BFE8NASACIQMDQCABKAIMIAJGBEACQCACIANNDQAgBCgCLEUNACAAIAAoAjAgASgCCCADaiACIANrEDU2AjALIAAQNiABKAIcIQQgASgCFCICIAEoAgxGDQMgASgCICEFIAIhAwsgBCgCECAFai0AACEEIAEgAkEBajYCFCABKAIIIAJqIAQ6AAAgASABKAIgQQFqIgU2AiAgBSABKAIcIgQvARRPBEAgAyECDAMFIAEoAhQhAgwBCwALAAsgAUHJADYCBAwCCwJAIAQoAixFDQAgASgCFCIDIAJNDQAgACAAKAIwIAEoAgggAmogAyACaxA1NgIwCyABKAIgIAQoAhRGBEAgAUHJADYCBCABQQA2AiAMAgsgASgCBCECCyACQckARw0BIAEoAhwhBAsgBCgCHEUNAiABKAIUIgIhAwJAA0ACQCABKAIMIAJGBEACQCACIANNDQAgASgCHCgCLEUNACAAIAAoAjAgASgCCCADaiACIANrEDU2AjALIAAQNiABKAIUIgIgASgCDEYNASACIQMLQQEhBSABKAIcKAIcIQQgASABKAIgIgZBAWo2AiAgBCAGai0AACEEIAEgAkEBajYCFCABKAIIIAJqIAQ6AAAgBARAIAEoAhQhAgwCBSADIQIMAwsACwtBACEFCwJAIAEoAhwiBCgCLEUNACABKAIUIgMgAk0NACAAIAAoAjAgASgCCCACaiADIAJrEDU2AjALIAUNASABKAIEIQILIAJB2wBHDQMgASgCHCEEDAILIAFBADYCIAsgAUHbADYCBAsgBCgCJEUNASABKAIUIgIhAwJAA0ACQCABKAIMIAJGBEACQCACIANNDQAgASgCHCgCLEUNACAAIAAoAjAgASgCCCADaiACIANrEDU2AjALIAAQNiABKAIUIgIgASgCDEYNASACIQMLQQEhBSABKAIcKAIkIQQgASABKAIgIgZBAWo2AiAgBCAGai0AACEEIAEgAkEBajYCFCABKAIIIAJqIAQ6AAAgBARAIAEoAhQhAgwCBSADIQIMAwsACwtBACEFCwJAIAEoAhwiBCgCLEUNACABKAIUIgMgAk0NACAAIAAoAjAgASgCCCACaiADIAJrEDU2AjALIAUNASABKAIEIQILIAJB5wBHDQIgASgCHCEEDAELIAFB5wA2AgQLIAQoAiwEQCABKAIUIgVBAmoiAiABKAIMIgRLBH8gABA2IAEoAgwhBCABKAIUIgVBAmoFIAILIARLDQEgACgCMCECIAEgBUEBajYCFCABKAIIIAVqIAI6AAAgACgCMCECIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAkEIdjoAACAAQQBBAEEAEDU2AjAgAUHxADYCBAwBCyABQfEANgIECwJAIAEoAhQEQCAAEDYgACgCEARAIAAoAgQhAgwCCwwECyAAKAIEIgINAEEAIQILAkACQAJAIAEoAgQiA0GaBUYEQCACRQ0BDAULIAINAQsgA0GaBUcNACABKAJ0RQ0BCwJ/AkACQAJAIAEoAogBQX5qDgIAAQILIAEQnQQMAgsgARCcBAwBCyABQQQgASgChAFBDGxBuNcAaigCABEDAAsiAkF+cUECRgRAIAFBmgU2AgQLIAJBfXFFBEBBACECIAAoAhANAgwECyACQQFHDQAgAUEAQQBBABCOAiAAEDYgACgCEA0ADAMLQQEhAiABKAIYIgNBAUgNACAAKAIwIQICQCADQQJGBEAgASABKAIUIgNBAWo2AhQgAyABKAIIaiACOgAAIAAoAjAhAiABIAEoAhQiA0EBajYCFCADIAEoAghqIAJBCHY6AAAgAC8BMiECIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAjoAACAALQAzIQIgASABKAIUIgNBAWo2AhQgAyABKAIIaiACOgAAIAAoAgghAiABIAEoAhQiA0EBajYCFCADIAEoAghqIAI6AAAgACgCCCECIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAkEIdjoAACAALwEKIQIgASABKAIUIgNBAWo2AhQgAyABKAIIaiACOgAAIAAtAAshAiABIAEoAhQiA0EBajYCFCADIAEoAghqIAI6AAAMAQsgASACQRB2EHUgASAALwEwEHULIAAQNiABKAIYIgBBAU4EQCABQQAgAGs2AhgLIAEoAhRFIQILIAIPCyAAQceEATYCGEF7DwsgAUF/NgIoQQAL3QEBBn8CQCAAKAKAgBAiBSAAKAKEgBAiAyAAKAKMgBAiBGpBBGpJDQAgACgClIAQIgIgBSADa0F9aiIGTw0AA0AgACACQf//A3FBAXRqQYCACGogAiAAIAIgA2oQOkECdGoiBCgCAGsiB0H//wMgB0H//wNJGzsBACAEIAI2AgAgAkEBaiICIAZJDQALIAAoAoyAECEECyAAIAQ2ApCAECAAIAM2AoiAECAAQQA2ApyAECAAIAE2AoCAECAAIAUgA2siAjYCjIAQIAAgAjYClIAQIAAgASACazYChIAQC9kDAQR/IwBBEGsiAyQAIAFBADYCACAAKAIAIgIgA0EMaiACKAIAKAIMEQMAIQICQCADKAIMRQ0AIAIsAAAhAiAAKAIAIgRBASAEKAIAKAIQEQQAIAEgASgCACACQf8AcXI2AgACQCACQX9KDQAgACgCACICIANBDGogAigCACgCDBEDACECIAMoAgxFDQEgAiwAACECIAAoAgAiBEEBIAQoAgAoAhARBAAgASABKAIAIAJB/wBxQQd0cjYCACACQX9KDQAgACgCACICIANBDGogAigCACgCDBEDACECIAMoAgxFDQEgAiwAACECIAAoAgAiBEEBIAQoAgAoAhARBAAgASABKAIAIAJB/wBxQQ50cjYCACACQX9KDQAgACgCACICIANBDGogAigCACgCDBEDACECIAMoAgxFDQEgAiwAACECIAAoAgAiBEEBIAQoAgAoAhARBAAgASABKAIAIAJB/wBxQRV0cjYCACACQX9KDQAgACgCACICIANBDGogAigCACgCDBEDACECIAMoAgxFDQEgAiwAACEFIAAoAgAiAEEBIAAoAgAoAhARBAAgASABKAIAIAVBHHRyNgIAIAVBf0oNAEEAIQUMAQtBASEFCyADQRBqJAAgBQvhSQE3fwJAIAAoAoCAECIJIAAoAoSAECILayAAKAKQgBBrIghBgIAETwRAIABBADYCnIAQDAELAkAgCA0AIAMoAgBBgSBIDQAgACAAKAKcgBBBoIAQECoiACABEKwEIAAgBTsBmIAQDAELAkAgBEEATEEAIAZBAkYbDQAgAygCACIIQYCAgPAHSw0AIAAgCCAJajYCgIAQQQkgBSAFQQFIGyIFQQwgBUEMSBsiG0EMbCIJQZQWaigCACEuAkACfyAbQQlNBEAgA0EANgIAIAIgBGoiOkF7aiA6IAZBAkYiOxshKSABIAhqITMgASEoIAIhCQJAIAhBDUgNACAzQXRqIjIgAUkNAEGANCAbdkEBcSE0IDNBe2oiGEF/aiEvIBhBfWohIkEAIRsDQCAAKAKUgBAhBCAAKAKIgBAhEyAAKAKcgBAhFCAoIQwDQCAAKAKQgBAiBSAMIAtrIh9BgYB8aiAFQYCABGogH0sbIRUgACgC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BEADQCADKAAAIAQoAABzIgkEQCAJECUgBGogAGsMBAsgA0EEaiEDIARBBGoiBCAUSQ0ACwsCQCAEIBhPDQAgAy8AACAELwAARw0AIANBAmohAyAEQQJqIQQLIAQgF0kEfyAEQQFqIAQgAy0AACAELQAARhsFIAQLIABrDAELIAMQJQsiAEHwAWpB/wFuakEIaiAPSw0EIAdBAmohAyAAIAZqQQRqIQYgBS0AACEEAn8gAEEPTwRAIAUgBEEPajoAACADQX8QNCAAQXFqIgRB/AdPBEADQCADQQRqIgNBfxA0IARBhHhqIgRB+wdLDQALCyADIARB//8DcUH/AW4iAGoiAyAAQYF+bCAEajoAACADQQFqDAELIAUgACAEajoAACADCyEFIAYgEU8NASAGQX5qIgAgACgAACALEDAgCCALIAwQSSAGKAAAIQACQAJAIBZFBEAgAEEBEDAiACAIEIUBIQQgBiAAIAhBASAMEEkgBEH//wNqIAZJDQEgBCgAACAGKAAARw0BDAILIAAgCxAwIgMgCCALEEghACAGIAxrIgQgAyAIIAsQXCAAQf//A2ogBEkNACAAIAxqIgQoAAAgBigAAEYNAQsgBkEBaiIDKAAAIAsQMCEEDAMLIAVBADoAACAFQQFqIQcMAAsACwtBACETIAUgECAGayIBaiABQfABakH/AW5qQQFqIA9LDQECQCABQQ9PBEAgBUHwAToAACAFQQFqIQAgAUFxaiIDQf8BSQRAIAAiBSADOgAADAILIABB/wEgAUHyfWoiAEH/AW5BAWoQKBogAEH/AW4iAyAFakECaiIFIANBgX5sIABqOgAADAELIAUgAUEEdDoAAAsgBUEBaiAGIAEQKiABaiACayETDAELIANBgICA8AdLDQAgASADaiIPQXVqIRAgD0F0aiEUIAgoAoCAASEAIAhBAUECIAFB//8DSxsiCzsBhoABIAggACADajYCgIABIAggCCgCkIABIANqNgKQgAEgASABKAAAIAsQMCAIIAsgASAAayIMEEkgD0F7aiITQX9qIRcgE0F9aiERIAZBBnQiCkEBciENIAFBAWoiAygAACALEDAhBCABQYCABEkhFSACIQUgASEGA0ACQCAVRQRAIAMgFEsNBCADQQFqIQ4gCiEJIA0hBwNAIAQgCBCFASEAIA4oAABBARAwIRIgAyAE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IAJBCE8EQANAIAMEQCADIAVsIQcgBUEHciIIIANsIQkgBUEGciIKIANsIQsgBUEFciIMIANsIQ0gBUEEciIOIANsIQ8gBUEDciIQIANsIREgBUECciISIANsIRMgBUEBciIUIANsIRVBACEEA0AgASAFIAIgBGwiBmpqIAAgBCAHamotAAA6AAAgASAGIBRqaiAAIAQgFWpqLQAAOgAAIAEgBiASamogACAEIBNqai0AADoAACABIAYgEGpqIAAgBCARamotAAA6AAAgASAGIA5qaiAAIAQgD2pqLQAAOgAAIAEgBiAMamogACAEIA1qai0AADoAACABIAYgCmpqIAAgBCALamotAAA6AAAgASAGIAhqaiAAIAQgCWpqLQAAOgAAIARBAWoiBCADRw0ACwsgBUEPaiEEIAVBCGohBSAEIAJJDQALCyACQXhxIgUgAk8NAANAIAMEQCADIAVsIQZBACEEA0AgASACIARsIAVqaiAAIAQgBmpqLQAAOgAAIARBAWoiBCADRw0ACwsgBUEBaiIFIAJHDQALCyACIANsrQuCAQEGfyABIAEgAG4iBiAAbGshByAAIAFNBEAgBkEBIAZBAUsbIQgDQCAABEAgACAEbCEJQQAhBQNAIAMgBSAJamogAiAFIAZsIARqai0AADoAACAFQQFqIgUgAEcNAAsLIARBAWoiBCAIRw0ACwsgAyABIAdrIgBqIAAgAmogBxAqGgsNACAAIAEgAiADEL0EC4IBAQZ/IAEgASAAbiIGIABsayEHIAAEQCAGQQEgBkEBSxshCANAIAAgAU0EQCAEIAZsIQlBACEFA0AgAyAFIAlqaiACIAAgBWwgBGpqLQAAOgAAIAVBAWoiBSAIRw0ACwsgBEEBaiIEIABHDQALCyADIAEgB2siAGogACACaiAHECoaC7gBAQN/AkAgAUEBSA0AIAAsAAAiBEH/AHEhAwJAIARBf0oNACABQQJIDQEgACwAASIEQQd0QYD/AHEgA3IhAyAEQX9KDQAgAUEDSA0BIAAsAAIiBEEOdEGAgP8AcSADciEDIARBf0oNACABQQRIDQEgACwAAyIEQRV0QYCAgP8AcSADciEDIARBf0oNACABQQVIDQEgAC0ABCIAQQ9LDQEgAEEcdCADciEDCyACIAM2AgBBASEFCyAFCw0AIAAgASACIAMQvwQLlAIB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CA0tEC0gLgAJDS4QLiAvAAoNLxAvIDAACw0wEDAgMQAEDjEQMSAyAAUOMhAyIDMABg4zEDMgNAAHDjQQNCA1AAgONRA1IDYACQ42EDYgNwAKDjcQNyA4AAsOOBA4IDkABA85EDkgOgAFDzoQOiA7AAYPOxA7IDwABw88EDwgAQgIDz0QPSABEAkPPhA+IAEYCg8/ED8gASALD0AQQCAAAAAA/wAAAP//AAD///8A/////2RlY29tcHJlc3MAY29tcHJlc3MAZnJlZV9yZXN1bHQAdmkAAHhzAABpaWlpaWlpAEGQDgvUBigHAAAwBwAAMAcAAMxzAADMcwAAzHMAABh0AAC2BwAAQHQAAEgHAAAAAAAAAQAAAIgHAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUUAABh0AACQBwAATlN0M19fMjIxX19iYXNpY19zdHJpbmdfY29tbW9uSUxiMUVFRQBOMTBlbXNjcmlwdGVuM3ZhbEUAAAAAGHQAANQHAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0loRUUAaWlpAAAoBwAAMAcAABgIAAAgCAAAJAgAACoIAAAxCAAANggAAGJsb3NjbHoAbHo0AGx6NGhjAHNuYXBweQB6bGliAHpzdGQARXJyb3IuICBudGhyZWFkcyBjYW5ub3QgYmUgbGFyZ2VyIHRoYW4gQkxPU0NfTUFYX1RIUkVBRFMgKCVkKQBFcnJvci4gIG50aHJlYWRzIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyAEVSUk9SOyByZXR1cm4gY29kZSBmcm9tIHB0aHJlYWRfY3JlYXRlKCkgaXMgJWQKAAlFcnJvciBkZXRhaWw6ICVzCgBCbG9zYyBoYXMgbm90IGJlZW4gY29tcGlsZWQgd2l0aCAnJXMnIABjb21wcmVzc2lvbiBzdXBwb3J0LiAgUGxlYXNlIHVzZSBvbmUgaGF2aW5nIGl0LgBFcnJvciBhbGxvY2F0aW5nIG1lbW9yeSEARVJST1I7IHJldHVybiBjb2RlIGZyb20gcHRocmVhZF9qb2luKCkgaXMgJWQKAElucHV0IGJ1ZmZlciBzaXplIGNhbm5vdCBleGNlZWQgJWQgYnl0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AAAIAAAACQAAAAkAAAAKAAAACgAAAAsAAAALAAAADAAAAAwAAAANAAAADQBBgNsAC/8IDAAIAIwACABMAAgAzAAIACwACACsAAgAbAAIAOwACAAcAAgAnAAIAFwACADcAAgAPAAIALwACAB8AAgA/AAIAAIACACCAAgAQgAIAMIACAAiAAgAogAIAGIACADiAAgAEgAIAJIACABSAAgA0gAIADIACACyAAgAcgAIAPIACAAKAAgAigAIAEoACADKAAgAKgAIAKoACABqAAgA6gAIABoACACaAAgAWgAIANoACAA6AAgAugAIAHoACAD6AAgABgAIAIYACABGAAgAxgAIACYACACmAAgAZgAIAOYACAAWAAgAlgAIAFYACADWAAgANgAIALYACAB2AAgA9gAIAA4ACACOAAgATgAIAM4ACAAuAAgArgAIAG4ACADuAAgAHgAIAJ4ACABeAAgA3gAIAD4ACAC+AAgAfgAIAP4ACAABAAgAgQAIAEEACADBAAgAIQAIAKEACABhAAgA4QAIABEACACRAAgAUQAIANEACAAxAAgAsQAIAHEACADxAAgACQAIAIkACABJAAgAyQAIACkACACpAAgAaQAIAOkACAAZAAgAmQAIAFkACADZAAgAOQAIALkACAB5AAgA+QAIAAUACACFAAgARQAIAMUACAAlAAgApQAIAGUACADlAAgAFQAIAJUACABVAAgA1QAIADUACAC1AAgAdQAIAPUACAANAAgAjQAIAE0ACADNAAgALQAIAK0ACABtAAgA7QAIAB0ACACdAAgAXQAIAN0ACAA9AAgAvQAIAH0ACAD9AAgAEwAJABMBCQCTAAkAkwEJAFMACQBTAQkA0wAJANMBCQAzAAkAMwEJALMACQCzAQkAcwAJAHMBCQDzAAkA8wEJAAsACQALAQkAiwAJAIsBCQBLAAkASwEJAMsACQDLAQkAKwAJACsBCQCrAAkAqwEJAGsACQBrAQkA6wAJAOsBCQAbAAkAGwEJAJsACQCbAQkAWwAJAFsBCQDbAAkA2wEJADsACQA7AQkAuwAJALsBCQB7AAkAewEJAPsACQD7AQkABwAJAAcBCQCHAAkAhwEJAEcACQBHAQkAxwAJAMcBCQAnAAkAJwEJAKcACQCnAQkAZwAJAGcBCQDnAAkA5wEJABcACQAXAQkAlwAJAJcBCQBX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AAAJ/ABgBwAAAAhRAAAIEQAVCIMAEgcfAAAIcQAACDEAAAnCABAHCgAACGEAAAghAAAJogAACAEAAAiBAAAIQQAACeIAEAcGAAAIWQAACBkAAAmSABMHOwAACHkAAAg5AAAJ0gARBxEAAAhpAAAIKQAACbIAAAgJAAAIiQAACEkAAAnyABAHBAAACFUAAAgVABAIAgETBysAAAh1AAAINQAACcoAEQcNAAAIZQAACCUAAAmqAAAIBQAACIUAAAhFAAAJ6gAQBwgAAAhdAAAIHQAACZoAFAdTAAAIfQAACD0AAAnaABIHFwAACG0AAAgtAAAJugAACA0AAAiNAAAITQAACfoAEAcDAAAIUwAACBMAFQjDABMHIwAACHMAAAgzAAAJxgARBwsAAAhjAAAIIwAACaYAAAgDAAAIgwAACEMAAAnmABAHBwAACFsAAAgbAAAJlgAUB0MAAAh7AAAIOwAACdYAEgcTAAAIawAACCsAAAm2AAAICwAACIsAAAhLAAAJ9gAQBwUAAAhXAAAIFwBACAAAEwczAAAIdwAACDcAAAnOABEHDwAACGcAAAgnAAAJrgAACAcAAAiHAAAIRwAACe4AEAcJAAAIXwAACB8AAAmeABQHYwAACH8AAAg/AAAJ3gASBxsAAAhvAAAILwAACb4AAAgPAAAIjwAACE8AAAn+AGAHAAAACFAAAAgQABQIcwASBx8AAAhwAAAIMAAACcEAEAcKAAAIYAAACCAAAAmhAAAIAAAACIAAAAhAAAAJ4QAQBwYAAAhYAAAIGAAACZEAEwc7AAAIeAAACDgAAAnRABEHEQAACGgAAAgoAAAJsQAACAgAAAiIAAAISAAACfEAEAcEAAAIVAAACBQAFQjjABMHKwAACHQAAAg0AAAJyQARBw0AAAhkAAAIJAAACakAAAgEAAAIhAAACEQAAAnpABAHCAAACFwAAAgcAAAJmQAUB1MAAAh8AAAIPAAACdkAEgcXAAAIbAAACCwAAAm5AAAIDAAACIwAAAhMAAAJ+QAQBwMAAAhSAAAIEgAVCKMAEwcjAAAIcgAACDIAAAnFABEHCwAACGIAAAgiAAAJpQAACAIAAAiCAAAIQgAACeUAEAcHAAAIWgAACBoAAAmVABQHQwAACHoAAAg6AAAJ1QASBxMAAAhqAAAIKgAACbUAAAgKAAAIigAACEoAAAn1ABAHBQAACFYAAAgWAEAIAAATBzMAAAh2AAAINgAACc0AEQcPAAAIZgAACCYAAAmtAAAIBgAACIYAAAhGAAAJ7QAQBwkAAAheAAAIHgAACZ0AFAdjAAAIfgAACD4AAAndABIHGwAACG4AAAguAAAJvQAACA4AAAiOAAAITgAACf0AYAcAAAAIUQAACBEAFQiDABIHHwAACHEAAAgxAAAJwwAQBwoAAAhhAAAIIQAACaMAAAgBAAAIgQAACEEAAAnjABAHBgAACFkAAAgZAAAJkwATBzsAAAh5AAAIOQAACdMAEQcRAAAIaQAACCkAAAmzAAAICQAACIkAAAhJAAAJ8wAQBwQAAAhVAAAIFQAQCAIBEwcrAAAIdQAACDUAAAnLABEHDQAACGUAAAglAAAJqwAACAUAAAiFAAAIRQAACesAEAcIAAAIXQAACB0AAAmbABQHUwAACH0AAAg9AAAJ2wASBxcAAAhtAAAILQAACbsAAAgNAAAIjQAACE0AAAn7ABAHAwAACFMAAAgTABUIwwATByMAAAhzAAAIMwAACccAEQcLAAAIYwAACCMAAAmnAAAIAwAACIMAAAhDAAAJ5wAQBwcAAAhbAAAIGwAACZcAFAdDAAAIewAACDsAAAnXABIHEwAACGsAAAgrAAAJtwAACAsAAAiLAAAISwAACfcAEAcFAAAIVwAACBcAQAgAABMHMwAACHcAAAg3AAAJzwARBw8AAAhnAAAIJwAACa8AAAgHAAAIhwAACEcAAAnvABAHCQAACF8AAAgfAAAJnwAUB2MAAAh/AAAIPwAACd8AEgcbAAAIbwAACC8AAAm/AAAIDwAACI8AAAhPAAAJ/wAQBQEAFwUBARMFEQAbBQEQEQUFABkFAQQVBUEAHQUBQBAFAwAYBQECFAUhABwFASASBQkAGgUBCBYFgQBABQAAEAUCABcFgQETBRkAGwUBGBEFBwAZBQEGFQVhAB0FAWAQBQQAGAUBAxQFMQAcBQEwEgUNABoFAQwWBcEAQAUAADEuMi44AHN0cmVhbSBlcnJvcgBpbnN1ZmZpY2llbnQgbWVtb3J5AGJ1ZmZlciBlcnJvcgBB5IQBC6EVazgHAA2yBwCc8gcAcGQIAGCuCgCwcQsAMKoMABMAAAAMAAAADQAAAAEAAAAGAAAAAQAAAAEAAAATAAAADQAAAA4AAAABAAAABwAAAAAAAAABAAAAFAAAAA8AAAAQAAAAAQAAAAYAAAAAAAAAAQAAABUAAAAQAAAAEQAAAAEAAAAFAAAAAAAAAAIAAAAVAAAAEgAAABIAAAABAAAABQAAAAAAAAACAAAAFQAAABIAAAATAAAAAgAAAAUAAAACAAAAAwAAABUAAAATAAAAEwAAAAMAAAAFAAAABAAAAAMAAAAVAAAAEwAAABMAAAADAAAABQAAAAgAAAAEAAAAFQAAABMAAAATAAAAAwAAAAUAAAAQAAAABQAAABUAAAATAAAAFAAAAAQAAAAFAAAAEAAAAAUAAAAWAAAAFAAAABUAAAAEAAAABQAAABAAAAAFAAAAFgAAABUAAAAWAAAABAAAAAUAAAAQAAAABQAAABYAAAAVAAAAFgAAAAUAAAAFAAAAEAAAAAUAAAAWAAAAFQAAABYAAAAFAAAABQAAACAAAAAGAAAAFgAAABYAAAAXAAAABQAAAAUAAAAgAAAABgAAABYAAAAXAAAAFwAAAAYAAAAFAAAAIAAAAAYAAAAWAAAAFgAAABYAAAAFAAAABQAAADAAAAAHAAAAFwAAABcAAAAWAAAABQAAAAQAAABAAAAABwAAABcAAAAXAAAAFgAAAAYAAAADAAAAQAAAAAgAAAAXAAAAGAAAABYAAAAHAAAAAwAAAAABAAAJAAAAGQAAABkAAAAXAAAABwAAAAMAAAAAAQAACQAAABoAAAAaAAAAGAAAAAcAAAADAAAAAAIAAAkAAAAbAAAAGwAAABkAAAAJAAAAAwAAAOcDAAAJAAAAEgAAAAwAAAANAAAAAQAAAAUAAAABAAAAAQAAABIAAAANAAAADgAAAAEAAAAGAAAAAAAAAAEAAAASAAAADgAAAA4AAAABAAAABQAAAAAAAAACAAAAEgAAABAAAAAQAAAAAQAAAAQAAAAAAAAAAgAAABIAAAAQAAAAEQAAAAIAAAAFAAAAAgAAAAMAAAASAAAAEgAAABIAAAADAAAABQAAAAIAAAADAAAAEgAAABIAAAATAAAAAwAAAAUAAAAEAAAABAAAABIAAAASAAAAEwAAAAQAAAAEAAAABAAAAAQAAAASAAAAEgAAABMAAAAEAAAABAAAAAgAAAAFAAAAEgAAABIAAAATAAAABQAAAAQAAAAIAAAABQAAABIAAAASAAAAEwAAAAYAAAAEAAAACAAAAAUAAAASAAAAEgAAABMAAAAFAAAABAAAAAwAAAAGAAAAEgAAABMAAAATAAAABwAAAAQAAAAMAAAABgAAABIAAAASAAAAEwAAAAQAAAAEAAAAEAAAAAcAAAASAAAAEgAAABMAAAAEAAAAAwAAACAAAAAHAAAAEgAAABIAAAATAAAABgAAAAMAAACAAAAABwAAABIAAAATAAAAEwAAAAYAAAADAAAAgAAAAAgAAAASAAAAEwAAABMAAAAIAAAAAwAAAAABAAAIAAAAEgAAABMAAAATAAAABgAAAAMAAACAAAAACQAAABIAAAATAAAAEwAAAAgAAAADAAAAAAEAAAkAAAASAAAAEwAAABMAAAAKAAAAAwAAAAACAAAJAAAAEgAAABMAAAATAAAADAAAAAMAAAAAAgAACQAAABIAAAATAAAAEwAAAA0AAAADAAAA5wMAAAkAAAARAAAADAAAAAwAAAABAAAABQAAAAEAAAABAAAAEQAAAAwAAAANAAAAAQAAAAYAAAAAAAAAAQAAABEAAAANAAAADwAAAAEAAAAFAAAAAAAAAAEAAAARAAAADwAAABAAAAACAAAABQAAAAAAAAACAAAAEQAAABEAAAARAAAAAgAAAAQAAAAAAAAAAgAAABEAAAAQAAAAEQAAAAMAAAAEAAAAAgAAAAMAAAARAAAAEQAAABEAAAADAAAABAAAAAQAAAAEAAAAEQAAABEAAAARAAAAAwAAAAQAAAAIAAAABQAAABEAAAARAAAAEQAAAAQAAAAEAAAACAAAAAUAAAARAAAAEQAAABEAAAAFAAAABAAAAAgAAAAFAAAAEQAAABEAAAARAAAABgAAAAQAAAAIAAAABQAAABEAAAARAAAAEQAAAAUAAAAEAAAACAAAAAYAAAARAAAAEgAAABEAAAAHAAAABAAAAAwAAAAGAAAAEQAAABIAAAARAAAAAwAAAAQAAAAMAAAABwAAABEAAAASAAAAEQAAAAQAAAADAAAAIAAAAAcAAAARAAAAEgAAABEAAAAGAAAAAwAAAAABAAAHAAAAEQAAABIAAAARAAAABgAAAAMAAACAAAAACAAAABEAAAASAAAAEQAAAAgAAAADAAAAAAEAAAgAAAARAAAAEgAAABEAAAAKAAAAAwAAAAACAAAIAAAAEQAAABIAAAARAAAABQAAAAMAAAAAAQAACQAAABEAAAASAAAAEQAAAAcAAAADAAAAAAIAAAkAAAARAAAAEgAAABEAAAAJAAAAAwAAAAACAAAJAAAAEQAAABIAAAARAAAACwAAAAMAAADnAwAACQAAAA4AAAAMAAAADQAAAAEAAAAFAAAAAQAAAAEAAAAOAAAADgAAAA8AAAABAAAABQAAAAAAAAABAAAADgAAAA4AAAAPAAAAAQAAAAQAAAAAAAAAAQAAAA4AAAAOAAAADwAAAAIAAAAEAAAAAAAAAAIAAAAOAAAADgAAAA4AAAAEAAAABAAAAAIAAAADAAAADgAAAA4AAAAOAAAAAwAAAAQAAAAEAAAABAAAAA4AAAAOAAAADgAAAAQAAAAEAAAACAAAAAUAAAAOAAAADgAAAA4AAAAGAAAABAAAAAgAAAAFAAAADgAAAA4AAAAOAAAACAAAAAQAAAAIAAAABQAAAA4AAAAPAAAADgAAAAUAAAAEAAAACAAAAAYAAAAOAAAADwAAAA4AAAAJAAAABAAAAAgAAAAGAAAADgAAAA8AAAAOAAAAAwAAAAQAAAAMAAAABwAAAA4AAAAPAAAADgAAAAQAAAADAAAAGAAAAAcAAAAOAAAADwAAAA4AAAAFAAAAAwAAACAAAAAIAAAADgAAAA8AAAAPAAAABgAAAAMAAABAAAAACAAAAA4AAAAPAAAADwAAAAcAAAADAAAAAAEAAAgAAAAOAAAADwAAAA8AAAAFAAAAAwAAADAAAAAJAAAADgAAAA8AAAAPAAAABgAAAAMAAACAAAAACQAAAA4AAAAPAAAADwAAAAcAAAADAAAAAAEAAAkAAAAOAAAADwAAAA8AAAAIAAAAAwAAAAABAAAJAAAADgAAAA8AAAAPAAAACAAAAAMAAAAAAgAACQAAAA4AAAAPAAAADwAAAAkAAAADAAAAAAIAAAkAAAAOAAAADwAAAA8AAAAKAAAAAwAAAOcDAAAJAAAAIAAAACAAAAAhAAAAIgAAACMAAAAkAAAAJQAAACYAAAAnAAAAKAAAACkAAAApAAAAKgAAACsAAAAsAAAALQAAAC4AAAAvAAAAMAAAADAAAAAxAAAAMQAAADIAAAAzAAAANAAAADUAAAA2AAAANwAAADgAAAA4AEGQmgEL+gEEAAMAAgACAAIAAgACAAIAAgACAAIAAgACAAEAAQABAAIAAgACAAIAAgACAAIAAgACAAMAAgABAAEAAQABAAEA//////////8AAAAAAAAAAAEAAQABAAEAAQABAAIAAgACAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAP////////////8AAAAAAAABAAQAAwACAAIAAgACAAIAAgABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAP//////////////////AEGVnAEL+AcIAAAABwAAagYAAAAGAACtBQAAagUAADEFAAAABQAA1AQAAK0EAACKBAAAagQAAEwEAAAxBAAAFwQAAAAEAADpAwAA1AMAAMADAACtAwAAmwMAAIoDAAB5AwAAagMAAFsDAABMAwAAPgMAADEDAAAkAwAAFwMAAAsDAAAAAwAA9AIAAOkCAADeAgAA1AIAAMoCAADAAgAAtgIAAK0CAACkAgAAmwIAAJICAACKAgAAggIAAHkCAAByAgAAagIAAGICAABbAgAAUwIAAEwCAABFAgAAPgIAADcCAAAxAgAAKgIAACQCAAAeAgAAFwIAABECAAALAgAABQIAAAACAAD6AQAA9AEAAO8BAADpAQAA5AEAAN4BAADZAQAA1AEAAM8BAADKAQAAxQEAAMABAAC7AQAAtgEAALIBAACtAQAAqAEAAKQBAACfAQAAmwEAAJcBAACSAQAAjgEAAIoBAACGAQAAggEAAH4BAAB5AQAAdQEAAHIBAABuAQAAagEAAGYBAABiAQAAXgEAAFsBAABXAQAAUwEAAFABAABMAQAASQEAAEUBAABCAQAAPgEAADsBAAA3AQAANAEAADEBAAAuAQAAKgEAACcBAAAkAQAAIQEAAB4BAAAaAQAAFwEAABQBAAARAQAADgEAAAsBAAAIAQAABQEAAAIBAAAAAQAA/QAAAPoAAAD3AAAA9AAAAPEAAADvAAAA7AAAAOkAAADmAAAA5AAAAOEAAADeAAAA3AAAANkAAADXAAAA1AAAANEAAADPAAAAzAAAAMoAAADHAAAAxQAAAMIAAADAAAAAvgAAALsAAAC5AAAAtgAAALQAAACyAAAArwAAAK0AAACrAAAAqAAAAKYAAACkAAAAogAAAJ8AAACdAAAAmwAAAJkAAACXAAAAlQAAAJIAAACQAAAAjgAAAIwAAACKAAAAiAAAAIYAAACEAAAAggAAAIAAAAB+AAAAewAAAHkAAAB3AAAAdQAAAHMAAAByAAAAcAAAAG4AAABsAAAAagAAAGgAAABmAAAAZAAAAGIAAABgAAAAXgAAAF0AAABbAAAAWQAAAFcAAABVAAAAUwAAAFIAAABQAAAATgAAAEwAAABKAAAASQAAAEcAAABFAAAAQwAAAEIAAABAAAAAPgAAAD0AAAA7AAAAOQAAADcAAAA2AAAANAAAADIAAAAxAAAALwAAAC4AAAAsAAAAKgAAACkAAAAnAAAAJQAAACQAAAAiAAAAIQAAAB8AAAAeAAAAHAAAABoAAAAZAAAAFwAAABYAAAAUAAAAEwAAABEAAAAQAAAADgAAAA0AAAALAAAACgAAAAgAAAAHAAAABQAAAAQAAAACAAAAAQBBkKUBC1EBAAAAAQAAAAEAAAABAAAAAgAAAAIAAAADAAAAAwAAAAQAAAAEAAAABQAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAQfGlAQu/AQECAwQFBgcICQoLDA0ODxAQERESEhMTFBQUFBUVFRUWFhYWFhYWFhcXFxcXFxcXGBgYGBgYGBgYGBgYGBgYGAABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICAhISIiIyMkJCQkJSUlJSYmJiYmJiYmJycnJycnJycoKCgoKCgoKCgoKCgoKCgoKSkpKSkpKSkpKSkpKSkpKSoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqAEHwpwELTQEAAAABAAAAAQAAAAEAAAACAAAAAgAAAAMAAAADAAAABAAAAAYAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAEHIqAELDQEAAAABAAAAAgAAAAIAQeCoAQvTBgEAAAABAAAAAgAAAAIAAAAmAAAAggAAACEFAABKAAAAZwgAACYAAADAAQAAgAAAAEkFAABKAAAAvggAACkAAAAsAgAAgAAAAEkFAABKAAAAvggAAC8AAADKAgAAgAAAAIoFAABKAAAAhAkAADUAAABzAwAAgAAAAJ0FAABKAAAAoAkAAD0AAACBAwAAgAAAAOsFAABLAAAAPgoAAEQAAACeAwAAgAAAAE0GAABLAAAAqgoAAEsAAACzAwAAgAAAAMEGAABNAAAAHw0AAE0AAABTBAAAgAAAACMIAABRAAAApg8AAFQAAACZBAAAgAAAAEsJAABXAAAAsRIAAFgAAADaBAAAgAAAAG8JAABdAAAAIxQAAFQAAABFBQAAgAAAAFQKAABqAAAAjBQAAGoAAACvBQAAgAAAAHYJAAB8AAAAThAAAHwAAADSAgAAgAAAAGMHAACRAAAAkAcAAJIAAAAAAAAAAQAAAAIAAAAEAAAAAAAAAAIAAAAEAAAACAAAAAAAAAABAAAAAQAAAAUAAAANAAAAHQAAAD0AAAB9AAAA/QAAAP0BAAD9AwAA/QcAAP0PAAD9HwAA/T8AAP1/AAD9/wAA/f8BAP3/AwD9/wcA/f8PAP3/HwD9/z8A/f9/AP3//wD9//8B/f//A/3//wf9//8P/f//H/3//z/9//9/AAAAAAEAAAACAAAAAwAAAAQAAAAFAAAABgAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAAAARAAAAEgAAABMAAAAUAAAAFQAAABYAAAAXAAAAGAAAABkAAAAaAAAAGwAAABwAAAAdAAAAHgAAAB8AAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABEAAAASAAAAEwAAABQAAAAVAAAAFgAAABcAAAAYAAAAGQAAABoAAAAbAAAAHAAAAB0AAAAeAAAAHwAAACAAAAAhAAAAIgAAACMAAAAlAAAAJwAAACkAAAArAAAALwAAADMAAAA7AAAAQwAAAFMAAABjAAAAgwAAAAMBAAADAgAAAwQAAAMIAAADEAAAAyAAAANAAAADgAAAAwABAEHErwELlQEBAAAAAgAAAAMAAAAEAAAABQAAAAYAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEgAAABQAAAAWAAAAGAAAABwAAAAgAAAAKAAAADAAAABAAAAAgAAAAAABAAAAAgAAAAQAAAAIAAAAEAAAACAAAABAAAAAgAAAAAABAAEAAAAEAAAACABB5LABC4sBAQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABIAAAAUAAAAFgAAABgAAAAcAAAAIAAAACgAAAAwAAAAQAAAAIAAAAAAAQAAAAIAAAAEAAAACAAAABAAAAAgAAAAQAAAAIAAAAAAAQBBsLIBC9YEAQAAAAEAAAABAAAAAQAAAAIAAAACAAAAAwAAAAMAAAAEAAAABgAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAAAABAAEBBgAAAAAAAAQAAAAAEAAABAAAAAAgAAAFAQAAAAAAAAUDAAAAAAAABQQAAAAAAAAFBgAAAAAAAAUHAAAAAAAABQkAAAAAAAAFCgAAAAAAAAUMAAAAAAAABg4AAAAAAAEFEAAAAAAAAQUUAAAAAAABBRYAAAAAAAIFHAAAAAAAAwUgAAAAAAAEBTAAAAAgAAYFQAAAAAAABwWAAAAAAAAIBgABAAAAAAoGAAQAAAAADAYAEAAAIAAABAAAAAAAAAAEAQAAAAAAAAUCAAAAIAAABQQAAAAAAAAFBQAAACAAAAUHAAAAAAAABQgAAAAgAAAFCgAAAAAAAAULAAAAAAAABg0AAAAgAAEFEAAAAAAAAQUSAAAAIAABBRYAAAAAAAIFGAAAACAAAwUgAAAAAAADBSgAAAAAAAYEQAAAABAABgRAAAAAIAAHBYAAAAAAAAkGAAIAAAAACwYACAAAMAAABAAAAAAQAAAEAQAAACAAAAUCAAAAIAAABQMAAAAgAAAFBQAAACAAAAUGAAAAIAAABQgAAAAgAAAFCQAAACAAAAULAAAAIAAABQwAAAAAAAAGDwAAACAAAQUSAAAAIAABBRQAAAAgAAIFGAAAACAAAgUcAAAAIAADBSgAAAAgAAQFMAAAAAAAEAYAAAEAAAAPBgCAAAAAAA4GAEAAAAAADQYAIABBlLcBC4MEAQAAAAEAAAAFAAAADQAAAB0AAAA9AAAAfQAAAP0AAAD9AQAA/QMAAP0HAAD9DwAA/R8AAP0/AAD9fwAA/f8AAP3/AQD9/wMA/f8HAP3/DwD9/x8A/f8/AP3/fwD9//8A/f//Af3//wP9//8H/f//D/3//x/9//8//f//fwAAAAABAAAAAgAAAAMAAAAEAAAABQAAAAYAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEQAAABIAAAAT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IGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AAAAGHQAAFBlAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lkRUUAABh0AAB4ZQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZkVFAAAYdAAAoGUAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SW1FRQAAGHQAAMhlAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lsRUUAABh0AADwZQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAAAYdAAAGGYAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQAAGHQAAEBmAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l0RUUAABh0AABoZgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAAAYdAAAkGYAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQAAGHQAALhmAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAAEB0AADwZgAAAAAAAAEAAACIBwAAAAAAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEaU5TXzExY2hhcl90cmFpdHNJRGlFRU5TXzlhbGxvY2F0b3JJRGlFRUVFAAAAQHQAAExnAAAAAAAAAQAAAIgHAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURzTlNfMTFjaGFyX3RyYWl0c0lEc0VFTlNfOWFsbG9jYXRvcklEc0VFRUUAAABAdAAAqGcAAAAAAAABAAAAiAcAAAAAAABOU3QzX18yMTJiYXNpY19zdHJpbmdJd05TXzExY2hhcl90cmFpdHNJd0VFTlNfOWFsbG9jYXRvckl3RUVFRQAAQHQAAABoAAAAAAAAAQAAAIgHAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAABEACgAREREAAAAABQAAAAAAAAkAAAAACwAAAAAAAAAAEQAPChEREQMKBwABAAkLCwAACQYLAAALAAYRAAAAERERAEGR0QELIQsAAAAAAAAAABEACgoREREACgAAAgAJCwAAAAkACwAACwBBy9EBCwEMAEHX0QELFQwAAAAADAAAAAAJDAAAAAAADAAADABBhdIBCwEOAEGR0gELFQ0AAAAEDQAAAAAJDgAAAAAADgAADgBBv9IBCwEQAEHL0gELHg8AAAAADwAAAAAJEAAAAAAAEAAAEAAAEgAAABISEgBBgtMBCw4SAAAAEhISAAAAAAAACQBBs9MBCwELAEG/0wELFQoAAAAACgAAAAAJCwAAAAAACwAACwBB7dMBCwEMAEH50wELJwwAAAAADAAAAAAJDAAAAAAADAAADAAALSsgICAwWDB4AChudWxsKQBBsNQBC2cwMTIzNDU2Nzg5QUJDREVGGRJEOwI/LEcUPTMwChsGRktFNw9JDo4XA0AdPGkrNh9KLRwBICUpIQgMFRYiLhA4Pgs0MRhkdHV2L0EJfzkRI0MyQomKiwUEJignDSoeNYwHGkiTE5SVAEGg1QEL9hNJbGxlZ2FsIGJ5dGUgc2VxdWVuY2UARG9tYWluIGVycm9yAFJlc3VsdCBub3QgcmVwcmVzZW50YWJsZQBOb3QgYSB0dHkAUGVybWlzc2lvbiBkZW5pZWQAT3BlcmF0aW9uIG5vdCBwZXJtaXR0ZWQATm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeQBObyBzdWNoIHByb2Nlc3MARmlsZSBleGlzdHMAVmFsdWUgdG9vIGxhcmdlIGZvciBkYXRhIHR5cGUATm8gc3BhY2UgbGVmdCBvbiBkZXZpY2UAT3V0IG9mIG1lbW9yeQBSZXNvdXJjZSBidXN5AEludGVycnVwdGVkIHN5c3RlbSBjYWxsAFJlc291cmNlIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlAEludmFsaWQgc2VlawBDcm9zcy1kZXZpY2UgbGluawBSZWFkLW9ubHkgZmlsZSBzeXN0ZW0ARGlyZWN0b3J5IG5vdCBlbXB0eQBDb25uZWN0aW9uIHJlc2V0IGJ5IHBlZXIAT3BlcmF0aW9uIHRpbWVkIG91dABDb25uZWN0aW9uIHJlZnVzZWQASG9zdCBpcyBkb3duAEhvc3QgaXMgdW5yZWFjaGFibGUAQWRkcmVzcyBpbiB1c2UAQnJva2VuIHBpcGUASS9PIGVycm9yAE5vIHN1Y2ggZGV2aWNlIG9yIGFkZHJlc3MAQmxvY2sgZGV2aWNlIHJlcXVpcmVkAE5vIHN1Y2ggZGV2aWNlAE5vdCBhIGRpcmVjdG9yeQBJcyBhIGRpcmVjdG9yeQBUZXh0IGZpbGUgYnVzeQBFeGVjIGZvcm1hdCBlcnJvcgBJbnZhbGlkIGFyZ3VtZW50AEFyZ3VtZW50IGxpc3QgdG9vIGxvbmcAU3ltYm9saWMgbGluayBsb29wAEZpbGVuYW1lIHRvbyBsb25nAFRvbyBtYW55IG9wZW4gZmlsZXMgaW4gc3lzdGVtAE5vIGZpbGUgZGVzY3JpcHRvcnMgYXZhaWxhYmxlAEJhZCBmaWxlIGRlc2NyaXB0b3IATm8gY2hpbGQgcHJvY2VzcwBCYWQgYWRkcmVzcwBGaWxlIHRvbyBsYXJnZQBUb28gbWFueSBsaW5rcwBObyBsb2NrcyBhdmFpbGFibGUAUmVzb3VyY2UgZGVhZGxvY2sgd291bGQgb2NjdXIAU3RhdGUgbm90IHJlY292ZXJhYmxlAFByZXZpb3VzIG93bmVyIGRpZWQAT3BlcmF0aW9uIGNhbmNlbGVkAEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZABObyBtZXNzYWdlIG9mIGRlc2lyZWQgdHlwZQBJZGVudGlmaWVyIHJlbW92ZWQARGV2aWNlIG5vdCBhIHN0cmVhbQBObyBkYXRhIGF2YWlsYWJsZQBEZXZpY2UgdGltZW91dABPdXQgb2Ygc3RyZWFtcyByZXNvdXJjZXMATGluayBoYXMgYmVlbiBzZXZlcmVkAFByb3RvY29sIGVycm9yAEJhZCBtZXNzYWdlAEZpbGUgZGVzY3JpcHRvciBpbiBiYWQgc3RhdGUATm90IGEgc29ja2V0AERlc3RpbmF0aW9uIGFkZHJlc3MgcmVxdWlyZWQATWVzc2FnZSB0b28gbGFyZ2UAUHJvdG9jb2wgd3JvbmcgdHlwZSBmb3Igc29ja2V0AFByb3RvY29sIG5vdCBhdmFpbGFibGUAUHJvdG9jb2wgbm90IHN1cHBvcnRlZABTb2NrZXQgdHlwZSBub3Qgc3VwcG9ydGVkAE5vdCBzdXBwb3J0ZWQAUHJvdG9jb2wgZmFtaWx5IG5vdCBzdXBwb3J0ZWQAQWRkcmVzcyBmYW1pbHkgbm90IHN1cHBvcnRlZCBieSBwcm90b2NvbABBZGRyZXNzIG5vdCBhdmFpbGFibGUATmV0d29yayBpcyBkb3duAE5ldHdvcmsgdW5yZWFjaGFibGUAQ29ubmVjdGlvbiByZXNldCBieSBuZXR3b3JrAENvbm5lY3Rpb24gYWJvcnRlZABObyBidWZmZXIgc3BhY2UgYXZhaWxhYmxlAFNvY2tldCBpcyBjb25uZWN0ZWQAU29ja2V0IG5vdCBjb25uZWN0ZWQAQ2Fubm90IHNlbmQgYWZ0ZXIgc29ja2V0IHNodXRkb3duAE9wZXJhdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzAE9wZXJhdGlvbiBpbiBwcm9ncmVzcwBTdGFsZSBmaWxlIGhhbmRsZQBSZW1vdGUgSS9PIGVycm9yAFF1b3RhIGV4Y2VlZGVkAE5vIG1lZGl1bSBmb3VuZABXcm9uZyBtZWRpdW0gdHlwZQBObyBlcnJvciBpbmZvcm1hdGlvbgAAYmFzaWNfc3RyaW5nAHN0ZDo6ZXhjZXB0aW9uAAAAAADccQAAPAAAAD0AAAA+AAAAGHQAAORxAABTdDlleGNlcHRpb24AAAAAAAAAAAhyAAAQAAAAPwAAAEAAAACMcgAAFHIAANxxAABTdDExbG9naWNfZXJyb3IAAAAAADhyAAAQAAAAQQAAAEAAAACMcgAARHIAAAhyAABTdDEybGVuZ3RoX2Vycm9yAFN0OXR5cGVfaW5mbwAAABh0AABVcgAAjHIAAAFzAABkcgAAjHIAAKxyAABscgAAAAAAANByAABCAAAAQwAAAEQAAABFAAAARgAAAEcAAABIAAAASQAAAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAAIxyAADccgAAeHIAAE4xMF9fY3h4YWJpdjEyMF9fc2lfY2xhc3NfdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMTZfX3NoaW1fdHlwZV9pbmZvRQAAAAAAAABAcwAAQgAAAEoAAABEAAAARQAAAEsAAACMcgAATHMAAGxyAABOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UAdgAAACxzAAB0cwAAYgAAACxzAACAcwAAYwAAACxzAACMcwAAaAAAACxzAACYcwAAYQAAACxzAACkcwAAcwAAACxzAACwcwAAdAAAACxzAAC8cwAAaQAAACxzAADIcwAAagAAACxzAADUcwAAbAAAACxzAADgcwAAbQAAACxzAADscwAAZgAAACxzAAD4cwAAZAAAACxzAAAEdAAAAAAAAHhyAABCAAAATAAAAEQAAABFAAAARgAAAE0AAABOAAAATwAAAAAAAABgdAAAQgAAAFAAAABEAAAARQAAAEYAAABRAAAAUgAAAFMAAACMcgAAbHQAAHhyAABOMTBfX2N4eGFiaXYxMjFfX3ZtaV9jbGFzc190eXBlX2luZm9FAAAAcHUAQZjpAQtBgC0AAAAyAAABAQAAHgEAAA8AAACALAAAAC0AAAAAAAAeAAAADwAAAAAAAAAwLAAAAAAAABMAAAAHAAAAAAAAAAUAQeTpAQsBOQBB/OkBCwo6AAAAOwAAAC12AEGU6gELAQIAQaPqAQsF//////8AQejqAQsJoH5QAAAAAAAFAEH86gELAVQAQZTrAQsOOgAAAFUAAACYegAAAAQAQazrAQsBAQBBu+sBCwUK/////w==";
var BloscShuffle;
(function(BloscShuffle2) {
  BloscShuffle2[BloscShuffle2["NOSHUFFLE"] = 0] = "NOSHUFFLE";
  BloscShuffle2[BloscShuffle2["SHUFFLE"] = 1] = "SHUFFLE";
  BloscShuffle2[BloscShuffle2["BITSHUFFLE"] = 2] = "BITSHUFFLE";
  BloscShuffle2[BloscShuffle2["AUTOSHUFFLE"] = -1] = "AUTOSHUFFLE";
})(BloscShuffle || (BloscShuffle = {}));
const COMPRESSORS = new Set(["blosclz", "lz4", "lz4hc", "snappy", "zlib", "zstd"]);
let emscriptenModule;
class Blosc {
  constructor(clevel = 5, cname = "lz4", shuffle = BloscShuffle.SHUFFLE, blocksize = 0) {
    if (clevel < 0 || clevel > 9) {
      throw new Error(`Invalid compression level: '${clevel}'. It should be between 0 and 9`);
    }
    if (!COMPRESSORS.has(cname)) {
      throw new Error(`Invalid compressor '${cname}'. Valid compressors include
        'blosclz', 'lz4', 'lz4hc','snappy', 'zlib', 'zstd'.`);
    }
    if (shuffle < -1 || shuffle > 2) {
      throw new Error(`Invalid shuffle ${shuffle}. Must be one of 0 (NOSHUFFLE),
        1 (SHUFFLE), 2 (BITSHUFFLE), -1 (AUTOSHUFFLE).`);
    }
    this.blocksize = blocksize;
    this.clevel = clevel;
    this.cname = cname;
    this.shuffle = shuffle;
  }
  static fromConfig(config) {
    const {blocksize, clevel, cname, shuffle} = config;
    return new Blosc(clevel, cname, shuffle, blocksize);
  }
  async encode(data) {
    if (!emscriptenModule) {
      emscriptenModule = initEmscriptenModule(blosc_codec, wasmSrc);
    }
    const module = await emscriptenModule;
    const view = module.compress(data, this.cname, this.clevel, this.shuffle, this.blocksize);
    const result = new Uint8Array(view);
    module.free_result();
    return result;
  }
  async decode(data, out) {
    if (!emscriptenModule) {
      emscriptenModule = initEmscriptenModule(blosc_codec, wasmSrc);
    }
    const module = await emscriptenModule;
    const view = module.decompress(data);
    const result = new Uint8Array(view);
    module.free_result();
    if (out !== void 0) {
      out.set(result);
      return out;
    }
    return result;
  }
}
Blosc.codecId = "blosc";
Blosc.COMPRESSORS = [...COMPRESSORS];
Blosc.NOSHUFFLE = BloscShuffle.NOSHUFFLE;
Blosc.SHUFFLE = BloscShuffle.SHUFFLE;
Blosc.BITSHUFFLE = BloscShuffle.BITSHUFFLE;
Blosc.AUTOSHUFFLE = BloscShuffle.AUTOSHUFFLE;
addCodec(Zlib.codecId, () => Zlib);
addCodec(GZip.codecId, () => GZip);
addCodec(Blosc.codecId, () => Blosc);

export { BoundsCheckError as B, ContainsArrayError as C, Group as G, HTTPStore as H, ZarrArray as Z, openArray as a, openGroup as o, slice as s };
