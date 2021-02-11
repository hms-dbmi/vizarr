import { atom, atomFamily, selector, waitForAll } from 'recoil';
import type { ZarrArray } from 'zarr';
import type { ImageLayer, MultiscaleImageLayer } from '@hms-dbmi/viv';
import type { PixelSource, Labels } from '@hms-dbmi/viv/dist/types';
import type { VivLayerProps } from 'viv-layers';

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
  source: string | ZarrArray['store'];
  name?: string;
  colormap?: string;
  opacity?: number;
  axis_labels: string[];
  translate?: number[];
  acquisition?: string;
  onClick?: (e: any) => void;
};

export type MultichannelConfig = {
  colors?: string[];
  channel_axis?: number;
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

export type Acquisition = {
  id: number;
  name: string;
};

export type SourceData<T extends string[]> = {
  loader: PixelSource<T> | PixelSource<T>[];
  source?: string | ZarrArray['store'];
  loaders?: (PixelSource<T> | undefined)[]; // for OME plates
  rows?: number;
  columns?: number;
  acquisitions?: Acquisition[];
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
  axis_labels: Labels<T>;
  translate: number[];
  onClick?: (e: any) => void;
};

export type LayerState<S extends string[]> = {
  Layer: null | ImageLayer | MultiscaleImageLayer;
  layerProps: VivLayerProps & {
    contrastLimits: number[][];
    source?: string | ZarrArray['store'];
    loaders?: (PixelSource<S> | undefined)[];
    rows?: number;
    columns?: number;
    onClick?: (e: any) => void;
  };
  on: boolean;
};

export const sourceInfoState = atom({
  key: 'sourceInfo',
  default: {} as { [id: string]: SourceData<any> },
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
  default: (id: string): LayerState<any> => ({
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
