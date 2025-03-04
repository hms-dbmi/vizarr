import type { ImageLayer, MultiscaleImageLayer } from "@hms-dbmi/viv";
import { atom } from "jotai";
import { atomFamily, splitAtom, waitForAll } from "jotai/utils";
import type { Matrix4 } from "math.gl";

import type * as zarr from "zarrita";
import type { ZarrPixelSource } from "./ZarrPixelSource";
import type { default as GridLayer, GridLayerProps, GridLoader } from "./gridLayer";
import { initLayerStateFromSource } from "./io";
import { RedirectError, rethrowUnless } from "./utils";

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

interface MultiscaleImageLayerProps extends BaseLayerProps {
  loader: Array<ZarrPixelSource>;
}

interface ImageLayerProps extends BaseLayerProps {
  loader: ZarrPixelSource;
}

type LayerMap = {
  image: [typeof ImageLayer, ImageLayerProps];
  multiscale: [typeof MultiscaleImageLayer, MultiscaleImageLayerProps];
  grid: [GridLayer, { loader: ZarrPixelSource | Array<ZarrPixelSource> } & GridLayerProps];
};

// biome-ignore lint/suspicious/noExplicitAny: Need a catch all for layer types
export type LayerCtr<T> = new (...args: Array<any>) => T;
export type LayerState<T extends "image" | "multiscale" | "grid" = "image" | "multiscale" | "grid"> = {
  Layer: LayerCtr<LayerMap[T][0]>;
  layerProps: LayerMap[T][1];
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

export const layerFamilyAtom = atomFamily(
  (param: WithId<SourceData>) => atom({ ...initLayerStateFromSource(param), id: param.id }),
  (a, b) => a.id === b.id,
);

export const layerAtoms = atom((get) => {
  const atoms = get(sourceInfoAtomAtoms);
  if (atoms.length === 0) return [];
  const layers = atoms.map((a) => layerFamilyAtom(get(a)));
  return get(waitForAll(layers));
});
