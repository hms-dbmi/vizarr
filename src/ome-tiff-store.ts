import { SourceHttp } from "@chunkd/source-http";
import { Compression, Predictor, Tiff, type TiffImage, TiffTag } from "@cogeotiff/core";
import { decompress } from "@developmentseed/lzw-tiff-decoder";
import * as utils from "./utils";

import type * as zarr from "zarrita";

/**
 * Returns the relative IFD index given the selection and the size of the image.
 *
 * This is is necessary because the IFD ordering is implicitly defined by the
 * dimension order.
 *
 * @param selection - The desired plane selection.
 * @param options.size - The size of each (z, t, c) dimension from the OME-XML.
 * @param options.dimensionOrder - The dimension order of the image from the OME-XML.
 */
function getRelativeOmeIfdIndex(
  selection: { z: number; t: number; c: number },
  options: {
    sizes: { z: number; t: number; c: number };
    dimensionOrder: string;
  },
) {
  const { z, t, c } = selection;
  const { sizes, dimensionOrder } = options;
  switch (dimensionOrder) {
    case "XYZCT":
      return z + sizes.z * c + sizes.z * sizes.c * t;
    case "XYZTC":
      return z + sizes.z * t + sizes.z * sizes.t * c;
    case "XYCTZ":
      return c + sizes.c * t + sizes.c * sizes.t * z;
    case "XYCZT":
      return c + sizes.c * z + sizes.c * sizes.z * t;
    case "XYTCZ":
      return t + sizes.t * c + sizes.t * sizes.c * z;
    case "XYTZC":
      return t + sizes.t * z + sizes.t * sizes.z * c;
    default:
      throw new Error(`Invalid dimension order: ${dimensionOrder}`);
  }
}

function encodeJson(obj: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj, null, 2));
}

function parseKey(key: zarr.AbsolutePath):
  | {
      kind: "meta";
      value: { kind: "root" } | { kind: "resolution"; value: number };
    }
  | {
      kind: "chunk";
      resolution: number;
      coords: { t: number; c: number; z: number; y: number; x: number };
    }
  | {
      kind: "unknown";
    } {
  if (key === "/zarr.json") {
    return { kind: "meta", value: { kind: "root" } };
  }
  let match = key.match(/^\/(\d+)\/zarr.json$/);
  if (match) {
    return {
      kind: "meta",
      value: { kind: "resolution", value: +match[1] },
    };
  }
  match = key.match(/^\/(\d+)\/c\/(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)$/);
  if (match) {
    let [resolution, t, c, z, y, x] = match.slice(1, 7).map((d) => +d);
    return {
      kind: "chunk",
      resolution,
      coords: { t, c, z, y, x },
    };
  }
  return { kind: "unknown" };
}

type Context = {
  tileSize: number;
  bytesPerPixel: number;
  predictor: Predictor;
  indexer(
    coords: {
      z: number;
      t: number;
      c: number;
    },
    resolution: number,
  ): Promise<TiffImage>;
  root: {
    zarrJson: Uint8Array;
  };
  resolutions: Array<{
    sizes: { t: number; c: number; z: number; y: number; x: number };
    zarrJson: Uint8Array;
  }>;
};

async function resolveMetadata(tiff: Tiff) {
  const image = tiff.images[0];
  const subIfds = (await image.fetch(TiffTag.SubIFDs)) as number[] | null;
  utils.assert(subIfds, "Only support bioformats >6");
  const raw = String(await image.fetch(TiffTag.ImageDescription));
  // biome-ignore lint/suspicious/noExplicitAny: proper validation later
  const xml = parseXml(raw) as Record<string, any>;

  const name = xml?.Image?.attr?.Name ?? "unknown";
  utils.assert(typeof name === "string");

  // TODO: translate to OME-NGFF "axes" units
  // const physicalSizeX = Number(xml.Image?.Pixels?.attr?.PhysicalSizeX);
  // const physicalSizeXUnit = xml.Image?.Pixels?.attr?.PhysicalSizeXUnit;
  // const physicalSizeY = Number(xml.Image?.Pixels?.attr?.PhysicalSizeY);
  // const physicalSizeYUnit = xml.Image?.Pixels?.attr?.PhysicalSizeYUnit;

  const sizeT = Number(xml.Image?.Pixels?.attr?.SizeT);
  const sizeC = Number(xml.Image?.Pixels?.attr?.SizeC);
  const sizeZ = Number(xml.Image?.Pixels?.attr?.SizeZ);
  const sizeY = Number(xml.Image?.Pixels?.attr?.SizeY);
  const sizeX = Number(xml.Image?.Pixels?.attr?.SizeX);
  utils.assert(
    !Number.isNaN(sizeT) &&
      !Number.isNaN(sizeC) &&
      !Number.isNaN(sizeZ) &&
      !Number.isNaN(sizeY) &&
      !Number.isNaN(sizeX),
  );

  let omero: Ome.Omero | undefined = undefined;
  if (Array.isArray(xml?.Image?.Pixels?.Channel) && xml.Image.Pixels.Channel.length === sizeC) {
    omero = {
      id: 1,
      version: "0.1",
      name: name,
      channels: xml.Image.Pixels.Channel.map(
        (entry: { attr: { Name: string; Color?: string } }, i: number) =>
          ({
            active: i < 6,
            label: entry.attr.Name,
            color: entry.attr.Color ? intToHexColor(Number(entry.attr.Color)) : utils.CYMRGB[i % utils.CYMRGB.length],
            coefficient: 1,
            family: "linear",
            inverted: false,
            window: {
              min: 0,
              max: 65535,
              start: 0,
              end: 65535,
            },
          }) satisfies Ome.Channel,
      ),
      rdefs: {
        model: "greyscale",
      },
    };
  }

  const dimensionOrder = xml.Image?.Pixels?.attr?.DimensionOrder;
  utils.assert(typeof dimensionOrder === "string");

  const interleaved = xml.Image?.Pixels?.attr?.Interleaved;
  utils.assert(interleaved === "false" || interleaved === undefined);

  const dataType = xml.Image?.Pixels?.attr?.Type;
  // Zarr will tell us if we have a supported dtype or not
  utils.assert(typeof dataType === "string");

  const bitsPerSample = image.value(TiffTag.BitsPerSample);
  const bytesPerPixel = bitsPerSample ? bitsPerSample[0] / 8 : 1;
  const predictor = image.value(TiffTag.Predictor) ?? Predictor.None;

  return {
    raw,
    dimensionOrder,
    dataType,
    name,
    sizes: { t: sizeT, c: sizeC, z: sizeZ, y: sizeY, x: sizeX },
    omero,
    resolutions: subIfds.length - 1,
    tileSize: getTileSize(image),
    bytesPerPixel,
    predictor,
  };
}

/**
 * cogeotiff only reads the top-level IFD chain during init(). Sub-IFDs
 * (used by bioformats for multi-resolution pyramids) must be parsed
 * separately. The `readIfd` method exists at runtime but is private in
 * the type declarations, so we use a runtime check to access it safely.
 */
function getReadIfd(tiff: Tiff): (offset: number, view: DataView & { sourceOffset: number }) => number {
  // @ts-expect-error - readIfd is private but we need it to parse sub-IFDs
  const fn: unknown = tiff.readIfd;
  utils.assert(typeof fn === "function", "Expected Tiff instance to have readIfd method");
  return fn.bind(tiff);
}

async function loadSubIfd(tiff: Tiff, offset: number): Promise<TiffImage> {
  const readIfd = getReadIfd(tiff);
  const bytes = await tiff.source.fetch(offset, tiff.defaultReadSize);
  const view = Object.assign(new DataView(bytes), { sourceOffset: offset });
  readIfd(offset, view);
  const subImage = tiff.images[tiff.images.length - 1];
  await subImage.init();
  return subImage;
}

async function createVirtualZarrMetadata(tiff: Tiff): Promise<Context> {
  const meta = await resolveMetadata(tiff);
  const ome = {
    omero: meta.omero,
    multiscales: [
      {
        datasets: Array.from({ length: meta.resolutions }, (_, i) => ({
          path: i.toString(),
        })),
        axes: [
          { name: "t", type: "time" },
          { name: "c", type: "channel" },
          { name: "z", type: "space" },
          { name: "y", type: "space" },
          { name: "x", type: "space" },
        ],
      },
    ],
  };
  const subIfdCache = new Map<number, TiffImage>();
  return {
    tileSize: meta.tileSize,
    bytesPerPixel: meta.bytesPerPixel,
    predictor: meta.predictor,
    async indexer(coords: { z: number; c: number; t: number }, resolution: number) {
      const baseImage = tiff.images[getRelativeOmeIfdIndex(coords, meta)];

      // It's the highest resolution, no need to look up SubIFDs.
      if (resolution === 0) {
        return baseImage;
      }

      const subIfdOffsets = (await baseImage.fetch(TiffTag.SubIFDs)) as number[];
      const offset = subIfdOffsets[resolution - 1];
      const cached = subIfdCache.get(offset);
      if (cached) return cached;

      const subImage = await loadSubIfd(tiff, offset);
      subIfdCache.set(offset, subImage);
      return subImage;
    },
    root: {
      zarrJson: encodeJson({
        zarr_format: 3,
        node_type: "group",
        attributes: { ome },
      }),
    },
    resolutions: Array.from({ length: meta.resolutions }, (_, resolution) => ({
      sizes: {
        ...meta.sizes,
        y: meta.sizes.y >> resolution,
        x: meta.sizes.x >> resolution,
      },
      zarrJson: encodeJson({
        zarr_format: 3,
        node_type: "array",
        shape: [meta.sizes.t, meta.sizes.c, meta.sizes.z, meta.sizes.y >> resolution, meta.sizes.x >> resolution],
        data_type: meta.dataType,
        chunk_grid: {
          name: "regular",
          configuration: {
            chunk_shape: [1, 1, 1, meta.tileSize, meta.tileSize],
          },
        },
        chunk_key_encoding: {
          name: "default",
          configuration: { separator: "/" },
        },
        codecs: [{ name: "bytes", configuration: { endian: "little" } }],
        fill_value: null,
      }),
    })),
  };
}

/**
 * Undo TIFF horizontal differencing (Predictor=2).
 *
 * To improve compression ratios, TIFF encoders can store each pixel as the
 * difference from its left neighbor instead of the absolute value. Adjacent
 * pixels in an image are usually similar, so these differences cluster near
 * zero and compress much better.
 *
 * This function reverses that transform by accumulating the differences back
 * into absolute values. The operation is per-row and per-byte — for multi-byte
 * samples (e.g. uint16), each byte lane is accumulated independently.
 */
function undoHorizontalDifferencing(data: Uint8Array, options: { tileSize: number; bytesPerPixel: number }) {
  const { tileSize, bytesPerPixel } = options;
  const rowBytes = tileSize * bytesPerPixel;
  for (let row = 0; row < tileSize; row++) {
    const rowStart = row * rowBytes;
    for (let i = rowStart + bytesPerPixel; i < rowStart + rowBytes; i++) {
      data[i] = (data[i] + data[i - bytesPerPixel]) & 0xff;
    }
  }
}

/** Swap bytes in-place from big-endian to little-endian for multi-byte samples. */
function swapEndianness(data: Uint8Array, bytesPerPixel: number) {
  const half = bytesPerPixel >>> 1;
  for (let i = 0; i < data.length; i += bytesPerPixel) {
    for (let j = 0; j < half; j++) {
      const lo = i + j;
      const hi = i + bytesPerPixel - 1 - j;
      const tmp = data[lo];
      data[lo] = data[hi];
      data[hi] = tmp;
    }
  }
}

/**
 * Decompress a raw TIFF tile, undo predictor differencing, and normalize
 * to little-endian so the zarr codec can always declare `endian: "little"`.
 */
async function decompressTile(
  tile: { bytes: ArrayBuffer; compression: Compression },
  options: { tileSize: number; bytesPerPixel: number; predictor: Predictor; isLittleEndian: boolean },
): Promise<Uint8Array> {
  const { tileSize, bytesPerPixel, predictor, isLittleEndian } = options;
  const maxUncompressedSize = tileSize * tileSize * bytesPerPixel;
  let data: Uint8Array;
  switch (tile.compression) {
    case Compression.None:
      data = new Uint8Array(tile.bytes);
      break;
    case Compression.Lzw: {
      data = await decompress(new Uint8Array(tile.bytes), maxUncompressedSize);
      break;
    }
    case Compression.Deflate:
    case Compression.DeflateOther: {
      const ds = new DecompressionStream("deflate");
      const writer = ds.writable.getWriter();
      writer.write(tile.bytes);
      writer.close();
      data = new Uint8Array(await new Response(ds.readable).arrayBuffer());
      break;
    }
    default:
      throw new Error(`Unsupported compression: ${tile.compression}`);
  }
  if (predictor === Predictor.Horizontal) {
    undoHorizontalDifferencing(data, { tileSize, bytesPerPixel });
  }
  if (!isLittleEndian && bytesPerPixel > 1) {
    swapEndianness(data, bytesPerPixel);
  }
  return data;
}

export class OmeTiffStore implements zarr.AsyncReadable<{ signal: AbortSignal }> {
  #tiff: Tiff;
  #context: Context | undefined = undefined;

  constructor(tiff: Tiff) {
    this.#tiff = tiff;
  }

  static async fromUrl(url: string) {
    return new OmeTiffStore(await Tiff.create(new SourceHttp(url)));
  }

  async get(key: zarr.AbsolutePath, options: { signal?: AbortSignal } = {}): Promise<Uint8Array | undefined> {
    const keyResult = parseKey(key);
    if (keyResult.kind === "unknown") {
      return undefined;
    }
    if (!this.#context) {
      this.#context = await createVirtualZarrMetadata(this.#tiff);
    }
    if (keyResult.kind === "meta") {
      if (keyResult.value.kind === "root") {
        return this.#context.root.zarrJson;
      }
      let resolution = keyResult.value.value;
      return this.#context.resolutions[resolution]?.zarrJson;
    }
    let { tileSize, bytesPerPixel, predictor } = this.#context;
    let { resolution, coords } = keyResult;
    let sizes = this.#context.resolutions[resolution]?.sizes;
    if (!sizes) {
      return undefined;
    }
    const image = await this.#context.indexer(coords, resolution);
    const tile = await image.getTile(coords.x, coords.y, { signal: options.signal });
    if (!tile) {
      // Sparse / empty tile — return zeros
      return new Uint8Array(tileSize * tileSize * bytesPerPixel);
    }
    return decompressTile(tile, { tileSize, bytesPerPixel, predictor, isLittleEndian: this.#tiff.isLittleEndian });
  }
}

type XmlNode = string | { [x: string]: XmlNode } | Array<XmlNode>;

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === 1;
}

function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

function xmlToJson(xmlNode: HTMLElement, options: { attrtibutesKey: string }): XmlNode {
  if (isText(xmlNode)) {
    // If the node is a text node
    return xmlNode.nodeValue?.trim() ?? "";
  }

  // If the node has no attributes and no children, return an empty string
  if (xmlNode.childNodes.length === 0 && (!xmlNode.attributes || xmlNode.attributes.length === 0)) {
    return "";
  }

  const xmlObj: XmlNode = {};

  if (xmlNode.attributes && xmlNode.attributes.length > 0) {
    const attrsObj: Record<string, string> = {};
    for (let i = 0; i < xmlNode.attributes.length; i++) {
      const attr = xmlNode.attributes[i];
      attrsObj[attr.name] = attr.value;
    }
    xmlObj[options.attrtibutesKey] = attrsObj;
  }

  for (let i = 0; i < xmlNode.childNodes.length; i++) {
    const childNode = xmlNode.childNodes[i];
    if (!isElement(childNode)) {
      continue;
    }
    const childXmlObj = xmlToJson(childNode, options);
    if (childXmlObj !== undefined && childXmlObj !== "") {
      if (childNode.nodeName === "#text" && xmlNode.childNodes.length === 1) {
        return childXmlObj;
      }
      if (xmlObj[childNode.nodeName]) {
        if (!Array.isArray(xmlObj[childNode.nodeName])) {
          xmlObj[childNode.nodeName] = [xmlObj[childNode.nodeName]];
        }
        (xmlObj[childNode.nodeName] as XmlNode[]).push(childXmlObj);
      } else {
        xmlObj[childNode.nodeName] = childXmlObj;
      }
    }
  }

  return xmlObj;
}

function parseXml(xmlString: string) {
  const parser = new DOMParser();
  // Remove trailing null character, which can break XML parsing in Firefox
  const doc = parser.parseFromString(
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Necessary for parsing XML
    xmlString.replace(/\u0000$/, ""),
    "application/xml",
  );
  return xmlToJson(doc.documentElement, { attrtibutesKey: "attr" });
}

function getTileSize(image: TiffImage) {
  const { width, height } = image.tileSize;
  const size = Math.min(width, height);
  // deck.gl requirement for power-of-two tile size.
  return 2 ** Math.floor(Math.log2(size));
}

/**
 * Converts 32-bit integer color representation to a 6-character hexadecimal RGB string.
 *
 * > console.log(intToHexColor(100100));
 * > // "018704"
 */
function intToHexColor(int: number): string {
  if (!Number.isInteger(int)) {
    throw Error("Not an integer.");
  }

  // Write number to int32 representation (4 bytes).
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, int, false); // offset === 0, littleEndian === false

  // Take u8 view and extract number for each byte (1 byte for R/G/B/A).
  const bytes = new Uint8Array(buffer);

  return [bytes[0], bytes[1], bytes[2]].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
