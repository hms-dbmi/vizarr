import type { ImageLayer, MultiscaleImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';
import type { Matrix4 } from '@math.gl/core/dist/esm';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { atomFamily, splitAtom, waitForAll } from 'jotai/utils';
import type { VivLayerProps } from 'viv-layers';
import type { ZarrArray } from 'zarr';
import type GridLayer from './gridLayer';
import { initLayerStateFromSource } from './io';

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

interface ViewState {
  zoom: number;
  target: number[];
  default?: boolean;
}

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
  Layer: LayerCtr<typeof ImageLayer | typeof MultiscaleImageLayer | GridLayer>;
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

type WithId<T> = T & { id: string };

export type ControllerProps<T = {}> = {
  sourceAtom: PrimitiveAtom<WithId<SourceData>>;
  layerAtom: PrimitiveAtom<WithId<LayerState>>;
} & T;

export const sourceInfoAtom = atom<WithId<SourceData>[]>([]);

export const viewStateAtom = atom<ViewState>(DEFAULT_VIEW_STATE);

export const sourceInfoAtomAtoms = splitAtom(sourceInfoAtom);

export const layerFamilyAtom = atomFamily<WithId<SourceData>, WithId<LayerState>, SetStateAction<WithId<LayerState>>>(
  (param) => atom({ ...initLayerStateFromSource(param), id: param.id }),
  (a, b) => a.id === b.id
);

export const layerAtoms = atom((get) => {
  const atoms = get(sourceInfoAtomAtoms);
  if (atoms.length === 0) return [];
  const layers = atoms.map((a) => layerFamilyAtom(get(a)));
  return get(waitForAll(layers));
});
