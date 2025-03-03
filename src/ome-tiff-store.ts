import * as geotiff from "geotiff";
// @ts-expect-error- we don't have the types for this
import { decompress } from "lzw-tiff-decoder";
import { CYMRGB } from "./utils";

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
  indexer(
    coords: {
      z: number;
      t: number;
      c: number;
    },
    resolution: number,
  ): Promise<geotiff.GeoTIFFImage>;
  root: {
    zarrJson: Uint8Array;
  };
  resolutions: Array<{
    sizes: { t: number; c: number; z: number; y: number; x: number };
    zarrJson: Uint8Array;
  }>;
};

async function resolveMetadata(tiff: geotiff.GeoTIFF) {
  const image = await tiff.getImage();
  const subIfds = image.fileDirectory.SubIFDs;
  assert(subIfds, "Only support bioformats >6");
  const raw = image.fileDirectory.ImageDescription;
  // biome-ignore lint/suspicious/noExplicitAny: proper validation later
  const xml = parseXml(raw) as Record<string, any>;

  const name = xml?.Image?.attr?.Name ?? "unknown";
  assert(typeof name === "string");

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
  assert(
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
            color: entry.attr.Color ? intToHexColor(Number(entry.attr.Color)) : CYMRGB[i % CYMRGB.length],
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
  assert(typeof dimensionOrder === "string");

  const interleaved = xml.Image?.Pixels?.attr?.Interleaved;
  assert(interleaved === "false" || interleaved === undefined);

  const dataType = xml.Image?.Pixels?.attr?.Type;
  // Zarr will tell us if we have a supported dtype or not
  assert(typeof dataType === "string");
  return {
    raw,
    dimensionOrder,
    dataType,
    name,
    sizes: { t: sizeT, c: sizeC, z: sizeZ, y: sizeY, x: sizeX },
    omero,
    resolutions: subIfds.length - 1,
    tileSize: getTileSize(image),
  };
}

type ImageFileDirectory = Awaited<ReturnType<geotiff.GeoTIFF["parseFileDirectoryAt"]>>;

async function createVirtualZarrMetadata(tiff: geotiff.GeoTIFF): Promise<Context> {
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
  const cache = new Map<number, ImageFileDirectory>();
  return {
    tileSize: meta.tileSize,
    async indexer(coords: { z: number; c: number; t: number }, resolution: number) {
      const baseImage = await tiff.getImage(getRelativeOmeIfdIndex(coords, meta));

      // It's the highest resolution, no need to look up SubIFDs.
      if (resolution === 0) {
        return baseImage;
      }

      const index = baseImage.fileDirectory.SubIFDs[resolution - 1];
      const ifd = cache.get(index) ?? (await tiff.parseFileDirectoryAt(index));
      cache.set(index, ifd);

      return new geotiff.GeoTIFFImage(
        ifd.fileDirectory,
        ifd.geoKeyDirectory,
        baseImage.dataView,
        tiff.littleEndian,
        tiff.cache,
        tiff.source,
      );
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

export class OmeTiffStore implements zarr.AsyncReadable<{ signal: AbortSignal }> {
  #tiff: geotiff.GeoTIFF;
  #context: Context | undefined = undefined;

  constructor(tiff: geotiff.GeoTIFF) {
    this.#tiff = tiff;
  }

  static async fromUrl(url: string) {
    // ensure we have the LZWDecoder registered
    geotiff.addDecoder(5, () => LZWDecoder);
    return new OmeTiffStore(await geotiff.fromUrl(url));
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
    let { tileSize } = this.#context;
    let { resolution, coords } = keyResult;
    let sizes = this.#context.resolutions[resolution]?.sizes;
    if (!sizes) {
      return undefined;
    }
    const extent = getTileExtent({ coords, tileSize, sizes });
    const x0 = coords.x * tileSize;
    const y0 = coords.y * tileSize;
    const image = await this.#context.indexer(coords, resolution);
    const rasterResult = await image.readRasters({
      window: [x0, y0, x0 + extent.width, y0 + extent.height],
      signal: options.signal,
    });
    const data = ensureFullSizeChunk(rasterResult, { tileSize });
    return new Uint8Array(data.buffer);
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

/**
 * Make an assertion.
 *
 * @param expression - The expression to test.
 * @param msg - The optional message to display if the assertion fails.
 *
 * @throws an {@link Error} if `expression` is not truthy.
 */
function assert(expression: unknown, msg: string | undefined = ""): asserts expression {
  if (!expression) throw new Error(msg);
}

function getTileSize(image: geotiff.GeoTIFFImage) {
  const tileWidth = image.getTileWidth();
  const tileHeight = image.getTileHeight();
  const size = Math.min(tileWidth, tileHeight);
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

function getTileExtent(options: {
  coords: { x: number; y: number };
  tileSize: number;
  sizes: { x: number; y: number };
}) {
  const { coords, tileSize, sizes } = options;
  const { y: zoomLevelHeight, x: zoomLevelWidth } = sizes;
  let height = tileSize;
  let width = tileSize;
  const maxXTileCoord = Math.floor(zoomLevelWidth / tileSize);
  const maxYTileCoord = Math.floor(zoomLevelHeight / tileSize);
  if (coords.x === maxXTileCoord) {
    width = zoomLevelWidth % tileSize;
  }
  if (coords.y === maxYTileCoord) {
    height = zoomLevelHeight % tileSize;
  }
  return { height, width };
}

/**
 * Ensures chunk data is complete for the expected tile size,
 * or create a new chunk with expected tile size (and data).
 */
function ensureFullSizeChunk(
  result: geotiff.ReadRasterResult,
  options: {
    tileSize: number;
  },
) {
  assert(Array.isArray(result));
  const { tileSize } = options;
  const [data] = result;
  const { width, height } = result;
  if (width === tileSize && height === tileSize) {
    return data;
  }
  const TypedArrayConstructor = data.constructor;
  // @ts-expect-error - TS doesn't know the stypes
  const full: geotiff.TypedArray = new TypedArrayConstructor(tileSize * tileSize);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      full[y * tileSize + x] = data[y * width + x];
    }
  }
  return full;
}

/** A custom WASM LZW decoder */
class LZWDecoder extends geotiff.BaseDecoder {
  maxUncompressedSize: number;

  constructor(fileDirectory: {
    TileWidth?: number;
    TileLength?: number;
    ImageWidth: number;
    ImageLength: number;
    BitsPerSample: number[];
  }) {
    super();
    const width = fileDirectory.TileWidth || fileDirectory.ImageWidth;
    const height = fileDirectory.TileLength || fileDirectory.ImageLength;
    const nbytes = fileDirectory.BitsPerSample[0] / 8;
    this.maxUncompressedSize = width * height * nbytes;
  }

  async decodeBlock(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    const decoded = await decompress(bytes, this.maxUncompressedSize);
    return decoded.buffer;
  }
}
