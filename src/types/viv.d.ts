declare module 'viv' {
  import { Layer } from '@deck.gl/core';
  import { ZarrArray } from 'zarr';

  type TypedArray = Uint8Array | Uint16Array | Uint32Array | Float32Array;
  type SupportedDtype = '<u1' | '<u2' | '<u4' | '<f4';

  type DtypeLookup = {
    format: number;
    dataFormat: number;
    type: number;
    max: number;
    TypedArray: TypedArray;
  };

  export const DTYPE_VALUES: {
    '<u1': DtypeLookup;
    '<u2': DtypeLookup;
    '<u4': DtypeLookup;
    '<f4': DtypeLookup;
  };

  type TileSelection = {
    x: number;
    y: number;
    z?: number;
    loaderSelection: number[][];
  };

  type RasterSelection = {
    z?: number;
    loaderSelection: number[][];
  };

  type SelectionData = {
    data: TypedArray[];
    width: number;
    height: number;
  };

  export class ZarrLoader {
    constructor(props: { data: ZarrArray | ZarrArray[]; dimensions: { field: string | number }[] });
    readonly isPyramid: boolean;
    readonly isRgb: boolean;
    readonly numLevels: number;
    readonly tileSize: number;
    readonly dtype: SupportedDtype;
    readonly base: ZarrArray;

    getTile(selection: TileSelection): Promise<SelectionData>;
    getRaster(selection: RasterSelection): Promise<SelectionData>;
    getRasterSize(selection: RasterSelection): { width: number; height: number };

    onTileError(error: Error): void;
  }

  export type VivLayerProps = {
    loader?: ZarrLoader;
    id: string;
    loaderSelection: number[][];
    colorValues: number[][];
    sliderValues: number[][];
    channelIsOn: boolean[];
    colormap: null | string;
    opacity: number;
  };

  export class ImageLayer extends Layer {
    constructor(
      props: VivLayerProps & {
        z?: number;
        translate?: number[];
        scale?: number[];
      }
    );
  }

  export class MultiscaleImageLayer extends Layer {
    constructor(props: VivLayerProps);
  }
}
