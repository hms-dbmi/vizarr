import { getImageSize } from "@hms-dbmi/viv";
import { BitmapLayer, TileLayer, type UpdateParameters } from "deck.gl";
import * as utils from "../utils";

import { type Matrix4, clamp } from "math.gl";
import type * as zarr from "zarrita";
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
 * @see {@href https://ngff.openmicroscopy.org/0.5/index.html#labels-md}
 *
 * The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64].
 */
type LabelDataType = zarr.Uint8 | zarr.Int8 | zarr.Uint16 | zarr.Int16 | zarr.Uint32 | zarr.Int32;
// TODO: bigint data types are supported by the spec but not by Viv's data loader.
// | zarr.Uint64
// | zarr.Int64;

/** The decoded tile data from a OME-NGFF label source */
type LabelPixelData = {
  data: zarr.TypedArray<LabelDataType>;
  width: number;
  height: number;
};

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
        let { data, width, height } = await resolution.getTile(request);
        utils.assert(
          !(data instanceof Float32Array) && !(data instanceof Float64Array),
          `The pixels of labels MUST be integer data types, got ${JSON.stringify(resolution.dtype)}`,
        );
        return { data, width, height };
      },
      renderSubLayers({ tile, data }) {
        const [[left, bottom], [right, top]] = tile.boundingBox;
        const { width, height } = dimensions;
        return new GrayscaleBitmapLayer({
          id: `tile-${tile.index.x}.${tile.index.y}.${tile.index.z}-${props.id}`,
          pixelData: data,
          opacity: props.opacity,
          modelMatrix: props.modelMatrix,
          lut: createColorLookupTable({ source: props.lut }),
          bounds: [clamp(left, 0, width), clamp(top, 0, height), clamp(right, 0, width), clamp(bottom, 0, height)],
          // For underlying class
          image: new ImageData(data.width, data.height),
          pickable: false,
        });
      },
    });
  }
}

export class GrayscaleBitmapLayer extends BitmapLayer<{ pixelData: LabelPixelData; lut: Float32Array }> {
  static layerName = "GrayscaleBitmapLayer";
  // @ts-expect-error - only way to extend the base state type
  state!: { texture: Texture } & BitmapLayer["state"];

  getShaders() {
    const lutSize = this.props.lut.length / 3;
    const sampler = (
      {
        Uint8Array: "usampler2D",
        Uint16Array: "usampler2D",
        Uint32Array: "usampler2D",
        Int8Array: "isampler2D",
        Int16Array: "isampler2D",
        Int32Array: "isampler2D",
      } as const
    )[typedArrayConstructorName(this.props.pixelData.data)];
    // replace the builtin fragment shader with our own
    return {
      ...super.getShaders(),
      fs: `\
#version 300 es
#define SHADER_NAME grayscale-bitmap-layer-fragment-shader

precision highp float;
precision highp int;
precision highp ${sampler};

uniform ${sampler} grayscaleTexture;
uniform float opacity;
uniform vec3 lut[${lutSize}];
uniform bool useLUT;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
  float intensity = float(texture(grayscaleTexture, vTexCoord).r) / ${lutSize - 1}.0;
  vec3 color;
  if (useLUT) {
    int index = int(floor(intensity * ${lutSize - 1}.0)) % ${lutSize};
    index = (index + ${lutSize}) % ${lutSize}; // Ensures index is always in the range [0, 255]
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
          data: props.pixelData.data,
          dimension: "2d",
          mipmaps: false,
          sampler: {
            minFilter: "nearest",
            magFilter: "nearest",
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
          },
          format: (
            {
              Uint8Array: "r8uint",
              Uint16Array: "r16uint",
              Uint32Array: "r32uint",
              Int8Array: "r8sint",
              Int16Array: "r16sint",
              Int32Array: "r32sint",
            } as const
          )[typedArrayConstructorName(props.pixelData.data)],
        }),
      });
    }
  }

  draw(opts: unknown) {
    const { model, texture } = this.state;
    if (model && texture) {
      model.setUniforms({
        // @ts-expect-error - Float32Array is ok here
        lut: this.props.lut ?? new Float32Array(),
        useLUT: !!this.props.lut,
      });
      model.setBindings({ grayscaleTexture: texture });
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

function createColorLookupTable(options: {
  source?: LabelLayerLut;
  palette?: ReadonlyArray<readonly [number, number, number]>;
}): Float32Array {
  const { source, palette = COLOR_PALETTES.pastel1 } = options;
  if (source) {
    const values = Object.keys(source).map((value) => +value);
    // This could blow up in size, should we worry about it?
    // What about alpha?
    const lut = new Float32Array(Math.max(...values) * 3);
    for (let [value, color] of Object.entries(source)) {
      const i = +value;
      lut[i * 3 + 0] = color[0];
      lut[i * 3 + 1] = color[1];
      lut[i * 3 + 2] = color[2];
    }
    return lut;
  }

  // generate a random categorical palette
  return Float32Array.from(palette.flat(), (d) => d / 255.0);
}

const COLOR_PALETTES = {
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

function typedArrayConstructorName(arr: zarr.TypedArray<LabelDataType>) {
  const ArrayType = arr.constructor as zarr.TypedArrayConstructor<LabelDataType>;
  const name = ArrayType.name as `${Capitalize<LabelDataType>}Array`;
  return name;
}
