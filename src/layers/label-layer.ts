import { getImageSize } from "@hms-dbmi/viv";
import { BitmapLayer, TileLayer, type UpdateParameters } from "deck.gl";
import * as utils from "../utils";
import fs from "./label-layer-fragment";

import { type Matrix4, clamp } from "math.gl";
import type { ZarrPixelSource } from "../ZarrPixelSource";
type Texture = ReturnType<BitmapLayer["context"]["device"]["createTexture"]>;

export type LabelLayerLut = Readonly<Record<number, readonly [number, number, number, number]>>;

export interface LabelLayerProps {
  id: string;
  loader: Array<ZarrPixelSource>;
  selection: Array<number>;
  opacity: number;
  modelMatrix: Matrix4;
  lut?: LabelLayerLut;
}

/**
 * The decoded tile data from a OME-NGFF label source
 *
 * @see {@href https://ngff.openmicroscopy.org/0.5/index.html#labels-md}
 *
 * The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64].
 *
 * TODO: Support integer data types beyond Uint8
 */
type LabelPixelData = { data: Uint8Array; width: number; height: number };

export class LabelLayer extends TileLayer<LabelPixelData> {
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
        // FIXME: Casting _any_ data type to Uint8Array
        return { data: new Uint8Array(data), width, height };
      },
      renderSubLayers({ tile, data }) {
        const [[left, bottom], [right, top]] = tile.boundingBox;
        const { width, height } = dimensions;
        return new GrayscaleBitmapLayer({
          id: `tile-${tile.index.x}.${tile.index.y}.${tile.index.z}-${props.id}`,
          pixelData: data,
          opacity: props.opacity,
          modelMatrix: props.modelMatrix,
          bounds: [clamp(left, 0, width), clamp(top, 0, height), clamp(right, 0, width), clamp(bottom, 0, height)],
          // For underlying class
          image: new ImageData(data.width, data.height),
          pickable: false,
        });
      },
    });
  }
}

export class GrayscaleBitmapLayer extends BitmapLayer<{ pixelData: LabelPixelData }> {
  static layerName = "GrayscaleBitmapLayer";
  // @ts-expect-error - only way to extend the base state type
  state!: { texture: Texture } & BitmapLayer["state"];

  getShaders() {
    const shaders = super.getShaders();
    // replace the builtin fragment shader with our own
    return { ...shaders, fs };
  }

  updateState({ props, oldProps, changeFlags, ...rest }: UpdateParameters<this>): void {
    super.updateState({ props, oldProps, changeFlags, ...rest });
    if (false && props.pixelData !== oldProps.pixelData || changeFlags.dataChanged) {
      if (this.state.texture) {
        this.state.texture.destroy();
      }
      this.setState({
        texture: this.context.device.createTexture({
          width: props.pixelData.width,
          height: props.pixelData.height,
          dimension: "2d",
          data: props.pixelData.data,
          mipmaps: false,
          sampler: {
            minFilter: "nearest",
            magFilter: "nearest",
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
          },
          format: "r8unorm",
        }),
      });
    }
  }

  draw(opts: unknown) {
    const { texture } = this.state;
    if (texture) {
      this.state.model?.setBindings({ grayscaleTexture: texture });
    }
    super.draw(opts);
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
