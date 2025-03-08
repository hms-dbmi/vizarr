import { type Atom, atom } from "jotai";
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
import { LabelLayer, type LabelLayerProps, type OmeColor } from "./layers/label-layer";
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

export type ImageLabels = Array<{
  name: string;
  loader: ZarrPixelSource[];
  modelMatrix: Matrix4;
  colors?: ReadonlyArray<OmeColor>;
}>;

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
  labels?: ImageLabels;
};

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
  labels?: Array<{
    layerProps: Omit<LabelLayerProps, "selection">;
    on: boolean;
    transformSourceSelection: (sourceSelection: Array<number>) => Array<number>;
  }>;
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

export type VizarrLayer =
  | Layer<MultiscaleImageLayerProps>
  | Layer<ImageLayerProps>
  | Layer<GridLayerProps>
  | Layer<LabelLayerProps>;

const LayerConstructors = {
  image: ImageLayer,
  multiscale: MultiscaleImageLayer,
  grid: GridLayer,
} as const;

const layerInstanceFamily = atomFamily((a: Atom<LayerState>) =>
  atom((get) => {
    const { on, layerProps, kind } = get(a);
    if (!on) {
      return null;
    }
    const Layer = LayerConstructors[kind];
    // @ts-expect-error - TS can't resolve that Layer & layerProps bound together
    return new Layer(layerProps) as VizarrLayer;
  }),
);

const imageLabelsIstanceFamily = atomFamily((a: Atom<LayerState>) =>
  atom((get) => {
    const { on, labels, layerProps } = get(a);
    if (!on || !labels) {
      return [];
    }
    return labels.map((label) =>
      label.on
        ? new LabelLayer({
            ...label.layerProps,
            selection: label.transformSourceSelection(layerProps.selections[0]),
          })
        : null,
    );
  }),
);

export const layerAtoms = atom((get) => {
  const layerAtoms = [];
  for (const sourceAtom of get(sourceInfoAtomAtoms)) {
    const layerStateAtom = layerFamilyAtom(get(sourceAtom));
    layerAtoms.push(layerInstanceFamily(layerStateAtom));
    layerAtoms.push(imageLabelsIstanceFamily(layerStateAtom));
  }
  return get(waitForAll(layerAtoms)).flat();
});
