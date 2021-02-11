declare module 'viv-layers' {
  import type { Layer } from '@deck.gl/core';
  import type { LayerProps } from '@deck.gl/core/lib/layer';
  import type { PixelSource } from '@hms-dbmi/viv';

  export interface VivLayerProps extends LayerProps<any> {
    loaderSelection: number[][];
    colorValues: number[][];
    sliderValues: number[][];
    channelIsOn: boolean[];
    colormap: null | string;
  };

  export class ImageLayer extends Layer<any, { loader: PixelSource } & VivLayerProps> {}
  export class MultiscaleImageLayer extends Layer<any, { loader: PixelSource[] } & VivLayerProps>{}
  export class XRLayer<D, P extends VivLayerProps<D>> extends Layer<D, P> {}
}
