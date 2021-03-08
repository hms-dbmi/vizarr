declare module 'viv-layers' {
  import type { Layer } from '@deck.gl/core';
  import type { Matrix4 } from 'math.gl';
  import type { LayerProps } from '@deck.gl/core/lib/layer';
  import type { PixelSource } from '@hms-dbmi/viv';

  export interface VivLayerProps extends LayerProps<any> {
    loaderSelection: number[][];
    colorValues: number[][];
    sliderValues: number[][];
    channelIsOn: boolean[];
    colormap: null | string;
    modelMatrix: Matrix4;
  };
}
