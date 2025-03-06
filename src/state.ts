import { atom } from "jotai";
import { atomFamily, splitAtom, waitForAll } from "jotai/utils";
import { RedirectError, rethrowUnless } from "./utils";

import type { Layer } from "deck.gl";
import type { PrimitiveAtom } from "jotai";
import type { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import type { Matrix4 } from "math.gl";
import type * as zarr from "zarrita";
import type { ZarrPixelSource } from "./ZarrPixelSource";
import { initLayerStateFromSource } from "./io";

import { GridLayer, type GridLayerProps, type GridLoader } from "./layers/grid-layer";
import {
  ImageLayer,
  type ImageLayerProps,
  MultiscaleImageLayer,
  type MultiscaleImageLayerProps,
} from "./layers/viv-layers";

export interface ViewState {
  zoom: number;
  target: [number, number];
}

interface BaseConfig {
  source: string | zarr.Readable;
  axis_labels?: string[];
  name?: string;
  colormap?: string;
  opacity?: number;
  acquisition?: string;
  model_matrix?: string | number[];
  onClick?: (e: unknown) => void;
}

export interface MultichannelConfig extends BaseConfig {
  colors?: string[];
  channel_axis?: number;
  contrast_limits?: [min: number, max: number][];
  names?: string[];
  visibilities?: boolean[];
}

export interface SingleChannelConfig extends BaseConfig {
  color?: string;
  contrast_limits?: [min: number, max: number];
  visibility?: boolean;
}

export type ImageLayerConfig = MultichannelConfig | SingleChannelConfig;

export type OnClickData = Record<string, unknown> & {
  gridCoord?: { row: number; column: number };
};

export type SourceData = {
  loader: ZarrPixelSource[];
  loaders?: GridLoader[]; // for OME plates
  rows?: number;
  columns?: number;
  acquisitions?: Ome.Acquisition[];
  acquisitionId?: number;
  name?: string;
  channel_axis: number | null;
  colors: string[];
  names: string[];
  contrast_limits: ([min: number, max: number] | undefined)[];
  visibilities: boolean[];
  defaults: {
    selection: number[];
    colormap: string;
    opacity: number;
  };
  model_matrix: Matrix4;
  axis_labels: string[];
  onClick?: (e: OnClickData) => void;
};

export type VivProps = ConstructorParameters<typeof MultiscaleImageLayer>[0];

export interface BaseLayerProps {
  id: string;
  contrastLimits: VivProps["contrastLimits"];
  colors: [r: number, g: number, b: number][];
  channelsVisible: NonNullable<VivProps["channelsVisible"]>;
  opacity: NonNullable<VivProps["opacity"]>;
  colormap: string; // TODO: more precise
  selections: number[][];
  modelMatrix: Matrix4;
  contrastLimitsRange: [min: number, max: number][];
  onClick?: (e: OnClickData) => void;
}

type LayerType = "image" | "multiscale" | "grid";
type LayerPropsMap = {
  image: ImageLayerProps;
  multiscale: MultiscaleImageLayerProps;
  grid: GridLayerProps;
};

export type LayerState<T extends LayerType = LayerType> = {
  kind: T;
  layerProps: LayerPropsMap[T];
  on: boolean;
};

type WithId<T> = T & { id: string };

export const viewStateAtom = atom<ViewState | null>(null);
export const sourceErrorAtom = atom<string | null>(null);

export interface Redirect {
  url: string;
  message: string;
}
export const redirectObjAtom = atom<Redirect | null>(null);

export const sourceInfoAtom = atom<WithId<SourceData>[]>([]);

export const addImageAtom = atom(null, async (get, set, config: ImageLayerConfig) => {
  const { createSourceData } = await import("./io");
  const id = Math.random().toString(36).slice(2);

  try {
    const sourceData = await createSourceData(config);
    const prevSourceInfo = get(sourceInfoAtom);
    if (!sourceData.name) {
      sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
    }
    set(sourceInfoAtom, [...prevSourceInfo, { id, ...sourceData }]);
  } catch (err) {
    rethrowUnless(err, Error);
    if (err instanceof RedirectError) {
      set(redirectObjAtom, { message: err.message, url: err.url });
    } else {
      set(sourceErrorAtom, err.message);
    }
  }
});

export const sourceInfoAtomAtoms = splitAtom(sourceInfoAtom);

export const layerFamilyAtom: AtomFamily<WithId<SourceData>, PrimitiveAtom<WithId<LayerState>>> = atomFamily(
  (param: WithId<SourceData>) => atom({ ...initLayerStateFromSource(param), id: param.id }),
  (a, b) => a.id === b.id,
);

export type VizarrLayer = Layer<MultiscaleImageLayerProps> | Layer<ImageLayerProps> | Layer<GridLayerProps>;

const LayerConstructors = {
  image: ImageLayer,
  multiscale: MultiscaleImageLayer,
  grid: GridLayer,
} as const;

export const layerAtoms = atom((get) => {
  const atoms = get(sourceInfoAtomAtoms);
  if (atoms.length === 0) {
    return [];
  }
  const layersState = get(waitForAll(atoms.map((a) => layerFamilyAtom(get(a)))));
  return layersState.map((layer) => {
    const Layer = LayerConstructors[layer.kind];
    // @ts-expect-error - TS can't resolve that Layer & layerProps bound together
    return new Layer(layer.layerProps);
  }) as Array<VizarrLayer>;
});
