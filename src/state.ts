import { atom, atomFamily, selector, waitForAll } from 'recoil';
import type { ZarrArray } from 'zarr';
import type { ImageLayer, MultiscaleImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';
import type { VivLayerProps } from 'viv-layers';
import type GridLayer from './gridLayer';
import { Matrix4 } from '@math.gl/core/dist/esm';

export const DEFAULT_VIEW_STATE = { zoom: 0, target: [0, 0, 0], default: true };
export const DEFAULT_LAYER_PROPS = {
  loader: [],
  colorValues: [],
  sliderValues: [],
  contrastLimits: [],
  loaderSelection: [],
  channelIsOn: [],
  colormap: '',
  opacity: 1,
  excludeBackground: true,
};

interface BaseConfig {
  source: string | ZarrArray['store'];
  axis_labels?: string[];
  name?: string;
  colormap?: string;
  opacity?: number;
  acquisition?: string;
  model_matrix?: string | number[];
  onClick?: (e: any) => void;
}

export interface MultichannelConfig extends BaseConfig {
  colors?: string[];
  channel_axis?: number;
  contrast_limits?: number[][];
  names?: string[];
  visibilities?: boolean[];
}

export interface SingleChannelConfig extends BaseConfig {
  color?: string;
  contrast_limits?: number[];
  visibility?: boolean;
}

export type ImageLayerConfig = MultichannelConfig | SingleChannelConfig;

export interface GridLoader {
  loader: ZarrPixelSource<string[]>;
  row: number;
  col: number;
  name: string;
}

export type SourceData = {
  loader: ZarrPixelSource<string[]>[];
  loaders?: GridLoader[]; // for OME plates
  rows?: number;
  columns?: number;
  acquisitions?: Ome.Acquisition[];
  acquisitionId?: number;
  name?: string;
  channel_axis: number | null;
  colors: string[];
  names: string[];
  contrast_limits: number[][];
  visibilities: boolean[];
  defaults: {
    selection: number[];
    colormap: string;
    opacity: number;
  };
  model_matrix: Matrix4;
  axis_labels: string[];
  onClick?: (e: any) => void;
};

export type LayerCtr<T> = new (...args: any[]) => T;
export type LayerState = {
  Layer: null | LayerCtr<typeof ImageLayer | typeof MultiscaleImageLayer | GridLayer>;
  layerProps: VivLayerProps & {
    loader: ZarrPixelSource<string[]> | ZarrPixelSource<string[]>[];
    contrastLimits: number[][];
    loaders?: GridLoader[];
    rows?: number;
    columns?: number;
    onClick?: (e: any) => void;
  };
  on: boolean;
};

export const sourceInfoState = atom({
  key: 'sourceInfo',
  default: {} as { [id: string]: SourceData },
});

export const layerIdsState = atom({
  key: 'layerIds',
  default: [] as string[],
});

export const viewerViewState = atom({
  key: 'viewerViewState',
  default: DEFAULT_VIEW_STATE as { zoom: number; target: number[]; default?: boolean },
});

export const layerStateFamily = atomFamily({
  key: 'layerStateFamily',
  default: (id: string): LayerState => ({
    Layer: null,
    layerProps: { id, modelMatrix: new Matrix4(), ...DEFAULT_LAYER_PROPS },
    on: false,
  }),
});

export const layersSelector = selector({
  key: 'layerSelector',
  get: ({ get }) => {
    const layerIds = get(layerIdsState);
    const layers = layerIds.map((id) => layerStateFamily(id));
    return get(waitForAll(layers));
  },
});
