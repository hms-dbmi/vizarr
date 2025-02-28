import { getImageSize } from "@hms-dbmi/viv";
import { BitmapLayer, TileLayer } from "deck.gl";
import * as utils from "../utils";

import type { PixelData } from "@vivjs/types";
import { type Matrix4, clamp } from "math.gl";
import type { ZarrPixelSource } from "../ZarrPixelSource";

export type LabelLayerLut = Readonly<Record<number, readonly [number, number, number, number]>>;

export interface LabelLayerProps {
  id: string;
  loader: Array<ZarrPixelSource>;
  selection: Array<number>;
  opacity: number;
  modelMatrix: Matrix4;
  lut?: LabelLayerLut;
}

export class LabelLayer extends TileLayer<PixelData> {
  constructor(props: LabelLayerProps) {
    const resolutions = props.loader;
    const dimensions = getImageSize(resolutions[0]);
    const tileSize = getTileSizeForResolutions(resolutions);
    super({
      id: `labels-${props.id}`,
      extent: [0, 0, dimensions.width, dimensions.height],
      tileSize: tileSize,
      minZoom: Math.round(-(resolutions.length - 1)),
      opacity: props.opacity,
      maxZoom: 0,
      modelMatrix: props.modelMatrix,
      zoomOffset: Math.round(Math.log2(props.modelMatrix ? props.modelMatrix.getScale()[0] : 1)),
      updateTriggers: {
        getTileData: [props.loader, props.selection],
      },
      async getTileData({ index, signal }) {
        const { x, y, z } = index;
        const resolution = resolutions[Math.round(-z)];
        const request = { x, y, signal, selection: props.selection };
        const { data, width, height } = await resolution.getTile(request);
        return { data, width, height };
      },
      renderSubLayers({ tile, data }) {
        const [[left, bottom], [right, top]] = tile.boundingBox;
        const { width, height } = dimensions;
        return new BitmapLayer(props, {
          id: `tile-${tile.index.x}.${tile.index.y}.${tile.index.z}-${props.id}`,
          image: renderGrayscalePixelDataToImage(data, { opacity: props.opacity, lut: props.lut }),
          bounds: [clamp(left, 0, width), clamp(top, 0, height), clamp(right, 0, width), clamp(bottom, 0, height)],
        });
      },
    });
  }
}

function getTileSizeForResolutions(resolutions: Array<ZarrPixelSource>): number {
  const tileSize = resolutions[0].tileSize;
  utils.assert(
    resolutions.every((resolution) => resolution.tileSize === tileSize),
    "resolutions must all have the same tile size",
  );
  return tileSize;
}

/**
 * Converts a grayscale image (single-channel pixel data) into an RGBA image.
 *
 * This function takes an input array of pixel intensity values (`data`), where each value
 * represents a grayscale intensity. It creates an `ImageData` object where nonzero pixels
 * are converted to a color with the fully specified opacity. Zero-value pixels remain fully transparent.
 *
 * TODO: We should create a custom deck sublayer to do this on the GPU instead
 */
function renderGrayscalePixelDataToImage(
  pixelData: PixelData,
  options: { opacity: number; lut?: LabelLayerLut },
): ImageData {
  const { data, width, height } = pixelData;
  const alpha = Math.round(options.opacity * 255);
  const mask = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i++) {
    const [r, g, b] = options?.lut?.[data[i]] ?? [255, 255, 255];
    const value = data[i] > 0 ? 1 : 0;
    const offset = i * 4;
    mask[offset] = r;
    mask[offset + 1] = g;
    mask[offset + 2] = b;
    mask[offset + 3] = value * alpha;
  }
  return new ImageData(mask, width, height);
}
