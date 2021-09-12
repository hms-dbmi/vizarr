import type { ImageLayer, MultiscaleImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';
import type { Matrix4 } from '@math.gl/core/dist/esm';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { atomFamily, splitAtom, waitForAll } from 'jotai/utils';
import type { VivLayerProps } from 'viv-layers';
import type { ZarrArray } from 'zarr';
import type GridLayer from './gridLayer';
import { initLayerStateFromSource } from './io';

import * as t from 'io-ts';
import { BooleanFromString } from 'io-ts-types/lib/BooleanFromString';
import { NumberFromString } from 'io-ts-types/lib/NumberFromString';
import { JsonFromString } from 'io-ts-types/lib/JsonFromString';
import type * as Ome from './ome-types';

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

// Imjoy objects aren't enumerable, so this type guard just ensures a primative isn't provided.
const isObject = (u: unknown): u is ZarrArray['store'] => typeof u === 'object' && u !== null;

const ZarrStore = new t.Type<ZarrArray['store'], ZarrArray['store'], unknown>(
  'ZarrStore',
  isObject,
  (u, c) => (isObject(u) ? t.success(u) : t.failure(u, c)),
  t.identity
);

const typeOrTypeFromJsonString = <A>(type: t.Type<A, any>) => t.union([type, t.string.pipe(JsonFromString.pipe(type))]);

const BaseConfig = t.intersection([
  t.type({ source: t.union([t.string, ZarrStore]) }),
  t.partial({
    axis_labels: typeOrTypeFromJsonString(t.array(t.string)),
    name: t.string,
    colormap: t.string,
    opacity: t.union([t.number, NumberFromString]),
    acquisition: t.union([t.number, NumberFromString]),
    model_matrix: t.string,
    onClick: new t.Type<(info: any) => void, (info: any) => void, unknown>(
      'OnClick',
      (u): u is (info: any) => void => typeof u === 'function',
      (u, c) => (typeof u === 'function' ? t.success(u as (info: any) => void) : t.failure(u, c)),
      t.identity
    ),
  }),
]);

const MultiChannelConfig = t.intersection([
  BaseConfig,
  t.partial({
    colors: typeOrTypeFromJsonString(t.array(t.string)),
    channel_axis: t.union([t.number, NumberFromString]),
    contrast_limits: typeOrTypeFromJsonString(t.array(t.array(t.number))),
    names: typeOrTypeFromJsonString(t.array(t.string)),
    visibilities: typeOrTypeFromJsonString(t.array(t.boolean)),
  }),
]);
type MultiChannelConfig = t.TypeOf<typeof MultiChannelConfig>;

const SingleChannelConfig = t.intersection([
  BaseConfig,
  t.partial({
    color: t.string,
    contrast_limits: typeOrTypeFromJsonString(t.array(t.number)),
    visibility: t.union([t.boolean, BooleanFromString]),
  }),
]);
type SingleChannelConfig = t.TypeOf<typeof SingleChannelConfig>;

const ImageLayerConfig = t.union([MultiChannelConfig, SingleChannelConfig]);
type ImageLayerConfig = t.TypeOf<typeof ImageLayerConfig>;

export { SingleChannelConfig, MultiChannelConfig, ImageLayerConfig };

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
  acquisitions?: t.TypeOf<typeof Ome.Acquisition>[];
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
