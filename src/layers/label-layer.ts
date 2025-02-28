import { getImageSize } from "@hms-dbmi/viv";
import { BitmapLayer, TileLayer, type UpdateParameters } from "deck.gl";
import * as utils from "../utils";

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
          lut: createLUT(props.lut),
          bounds: [clamp(left, 0, width), clamp(top, 0, height), clamp(right, 0, width), clamp(bottom, 0, height)],
          // For underlying class
          image: new ImageData(data.width, data.height),
          pickable: false,
        });
      },
    });
  }
}

export class GrayscaleBitmapLayer extends BitmapLayer<{ pixelData: LabelPixelData; lut?: Float32Array }> {
  static layerName = "GrayscaleBitmapLayer";
  // @ts-expect-error - only way to extend the base state type
  state!: { texture: Texture } & BitmapLayer["state"];

  getShaders() {
    const shaders = super.getShaders();
    // replace the builtin fragment shader with our own
    return {
      ...shaders,
      fs: `\
#version 300 es
#define SHADER_NAME grayscale-bitmap-layer-fragment-shader

precision highp float;

uniform sampler2D grayscaleTexture;
uniform float opacity;
uniform vec3 lut[256];
uniform bool useLUT;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
  float intensity = texture(grayscaleTexture, vTexCoord).r;
  vec3 color;
  if (useLUT) {
    int index = int(floor(intensity * 255.0));
    index = clamp(index, 0, 255);
    color = lut[index];
  } else {
    color = vec3(1.0);
  }
  intensity = (intensity > 0.0) ? 1.0 : 0.0;
  fragColor = vec4(color, intensity * opacity);
}
`,
    };
  }

  updateState({ props, oldProps, changeFlags, ...rest }: UpdateParameters<this>): void {
    super.updateState({ props, oldProps, changeFlags, ...rest });
    if (props.pixelData !== oldProps.pixelData || changeFlags.dataChanged) {
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
    if (this.props.lut) {
    }
    this.state.model?.setUniforms({
      // @ts-expect-error - Float32Array is ok here
      lut: this.props.lut ?? new Float32Array(),
      useLUT: !!this.props.lut,
    });
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

function createLUT(source?: LabelLayerLut) {
  if (source) {
    const lut = new Float32Array(256 * 3);
    for (let [value, color] of Object.entries(source)) {
      lut[+value * 3 + 0] = color[0];
      lut[+value * 3 + 1] = color[1];
      lut[+value * 3 + 2] = color[2];
    }
    return lut;
  }
  return generateCategoricalLUT();
}

const palettes = {
  pastel1: [
    [251, 180, 174],
    [179, 205, 227],
    [204, 235, 197],
    [222, 203, 228],
    [254, 217, 166],
    [255, 255, 204],
    [229, 216, 189],
    [253, 218, 236],
    [242, 242, 242],
  ],
  set3: [
    [141, 211, 199],
    [255, 255, 179],
    [190, 186, 218],
    [251, 128, 114],
    [128, 177, 211],
    [253, 180, 98],
    [179, 222, 105],
    [252, 205, 229],
    [217, 217, 217],
    [188, 128, 189],
  ],
} as const;

function generateCategoricalLUT(
  palette: ReadonlyArray<readonly [number, number, number, a?: number]> = palettes.pastel1,
) {
  const lut = new Float32Array(256 * 3);

  for (let i = 0; i < 256; i++) {
    const color = palette[i % palette.length];
    lut[i * 3 + 0] = color[0] / 255.0;
    lut[i * 3 + 1] = color[1] / 255.0;
    lut[i * 3 + 2] = color[2] / 255.0;
  }

  return lut;
}
