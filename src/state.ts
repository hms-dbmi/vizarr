import { atom, PrimitiveAtom, WritableAtom, SetStateAction } from 'jotai';
import { splitAtom } from 'jotai/utils';
import type { ZarrArray } from 'zarr';
import type { ImageLayer, MultiscaleImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';
import type { VivLayerProps } from 'viv-layers';
import type GridLayer from './gridLayer';
import type { Matrix4 } from '@math.gl/core/dist/esm';
import { atomFamily } from 'jotai/utils';
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

export const sourceInfoAtom = atom<(SourceData & { id: string })[]>([]);

export const layerFamilyAtom = atomFamily<SourceData & { id: string }, LayerState, SetStateAction<LayerState>>(
  (param) => atom(initLayerStateFromSource(param)),
  (a, b) => a.id === b.id
);

export const viewStateAtom = atom<ViewState>(DEFAULT_VIEW_STATE);

export const sourceInfoAtomAtoms = splitAtom(sourceInfoAtom);

export interface AtomPairs {
  sourceAtom: PrimitiveAtom<SourceData & { id: string }>;
  layerAtom: WritableAtom<LayerState, SetStateAction<LayerState>>;
}
