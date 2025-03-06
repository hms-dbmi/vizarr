/**
 * Type-complete interfaces to Viv's core layers
 *
 * @module
 */
import { ImageLayer as BaseImageLayer, MultiscaleImageLayer as BaseMultiscaleImageLayer } from "@hms-dbmi/viv";

import type { Layer } from "deck.gl";
import type { Matrix4 } from "math.gl";
import type { ZarrPixelSource } from "../ZarrPixelSource";

export interface BaseLayerProps {
  id: string;
  contrastLimits: Array<[min: number, max: number]>;
  colors: [r: number, g: number, b: number][];
  channelsVisible: Array<boolean>;
  opacity: number;
  colormap: string; // TODO: more precise
  selections: number[][];
  modelMatrix: Matrix4;
  contrastLimitsRange: [min: number, max: number][];
  onClick?: (e: Record<string, unknown>) => void;
}

export interface MultiscaleImageLayerProps extends BaseLayerProps {
  loader: Array<ZarrPixelSource>;
}

// @ts-expect-error - Viv does faithfully implement the Layer interface, just not captured in the types
export class MultiscaleImageLayer
  extends BaseMultiscaleImageLayer<string[]>
  implements Layer<MultiscaleImageLayerProps>
{
  static layerName = "VizarMultiscaleImageLayer";
  // biome-ignore lint/complexity/noUselessConstructor: Necessary for TypeScript to get the types
  constructor(props: MultiscaleImageLayerProps) {
    // @ts-expect-error - Viv's types are not correct
    super(props);
  }
}

export interface ImageLayerProps extends BaseLayerProps {
  loader: ZarrPixelSource;
}

// @ts-expect-error - Viv does faithfully implement the Layer interface, just not captured in the types
export class ImageLayer extends BaseImageLayer<string[]> implements Layer<ImageLayerProps> {
  static layerName = "VizarrImageLayer";
  // biome-ignore lint/complexity/noUselessConstructor: Necessary for TypeScript to get the types
  constructor(props: ImageLayerProps) {
    // @ts-expect-error - Viv's types are not correct
    super(props);
  }
}
