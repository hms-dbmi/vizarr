declare module 'viv-layers' {
  import type { Layer } from '@deck.gl/core';
  import type { Matrix4 } from '@math.gl/core/dist/esm';
  import type { LayerProps } from '@deck.gl/core/lib/layer';
  import type { PixelSource } from '@hms-dbmi/viv';

  export interface VivLayerProps extends LayerProps<any> {
    selections: number[][];
    colors: number[][];
    contrastLimits: number[][];
    channelsVisible: boolean[];
    colormap: null | string;
    modelMatrix: Matrix4;
  }
}
