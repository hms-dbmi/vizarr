import { atom, atomFamily, selector, waitForAll } from 'recoil';
import type { HTTPStore } from 'zarr';
import type { VivLayerProps, ImageLayer, MultiscaleImageLayer, ZarrLoader } from 'viv';

export const DEFAULT_VIEW_STATE = { zoom: 0, target: [0, 0, 0], default: true };
export const DEFAULT_LAYER_PROPS = {
  loader: undefined,
  colorValues: [],
  sliderValues: [],
  contrastLimits: [],
  loaderSelection: [],
  channelIsOn: [],
  colormap: '',
  opacity: 1,
};

export type BaseConfig = {
  source: string | HTTPStore;
  channel_axis?: number;
  name?: string;
  colormap?: string;
  opacity?: number;
  axis_labels: string[];
};

export type MultichannelConfig = {
  colors?: string[];
  contrast_limits?: number[][];
  names?: string[];
  visibilities?: boolean[];
} & BaseConfig;

export type SingleChannelConfig = {
  color?: string;
  contrast_limits?: number[];
  visibility?: boolean;
} & BaseConfig;

export type ImageLayerConfig = BaseConfig | MultichannelConfig | SingleChannelConfig;

export type SourceData = {
  loader: ZarrLoader;
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
  axis_labels: string[];
};

export type LayerState = {
  Layer: null | ImageLayer | MultiscaleImageLayer;
  layerProps: VivLayerProps & { contrastLimits: number[][] };
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
    layerProps: { id, ...DEFAULT_LAYER_PROPS },
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
