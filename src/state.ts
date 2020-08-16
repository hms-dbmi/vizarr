import { atom, atomFamily, selector, waitForAll } from 'recoil';
import type { HTTPStore } from 'zarr';
import type { VivLayerProps, ImageLayer, MultiscaleImageLayer } from 'viv';

export const DEFAULT_VIEW_STATE = { zoom: 0, target: [0, 0, 0], default: true };
export const DEFAULT_LAYER_PROPS = {
  loader: undefined,
  colorValues: [],
  sliderValues: [],
  loaderSelection: [],
  channelIsOn: [],
  colormap: '',
  opacity: 1,
};

const DEFAULT_LAYER_METADATA = {
  name: undefined,
  on: false,
  labels: [],
  channel_axis: null,
  contrastLimits: [],
};

export interface BaseConfig {
  source: string | HTTPStore;
  name?: string;
  colormap?: string;
  opacity?: number;
}

export interface SourceNdConfig {
  channel_axis: number;
  colors?: string[];
  contrast_limits?: number[][];
  labels?: string[];
  visibilities?: boolean[];
}

export interface Source2DConfig {
  color?: string;
  contrast_limits?: number[];
  label?: string;
  visibility?: boolean;
}

export type ImageLayerConfig = BaseConfig | (BaseConfig & SourceNdConfig) | (BaseConfig & Source2DConfig);

export interface LayerMetadata {
  name?: string;
  on: boolean;
  labels: string[];
  channel_axis: number | null;
  contrastLimits: number[][];
}

export interface LayerState {
  Layer: null | ImageLayer | MultiscaleImageLayer;
  layerProps: VivLayerProps;
  metadata: LayerMetadata;
}

export const sourceInfoState = atom({
  key: 'sourceInfo',
  default: {} as { [id: string]: ImageLayerConfig },
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
    layerProps: { id, ...DEFAULT_LAYER_PROPS },
    metadata: DEFAULT_LAYER_METADATA,
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
