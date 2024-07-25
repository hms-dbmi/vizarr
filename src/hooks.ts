import { type PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import * as React from "react";

import { type SourceData, type ViewState, layerFamilyAtom } from "./state";
import { assert } from "./utils";

type WithId<T> = { id: string } & T;
type SourceDataAtom = PrimitiveAtom<WithId<SourceData>>;
type ViewStateAtom = PrimitiveAtom<ViewState | undefined>;

export const LayerContext = React.createContext<null | SourceDataAtom>(null);
export const ViewStateContext = React.createContext<null | ViewStateAtom>(null);

function useSourceAtom(): SourceDataAtom {
  const sourceAtom = React.useContext(LayerContext);
  assert(sourceAtom !== null, "useSourceAtom must be used within a LayerContext.Provider");
  return sourceAtom;
}

function useLayerAtom() {
  const sourceAtom = useSourceAtom();
  const sourceInfo = useAtomValue(sourceAtom);
  return layerFamilyAtom(sourceInfo);
}

export function useSourceValue() {
  const sourceAtom = useSourceAtom();
  return useAtomValue(sourceAtom);
}

export function useSource() {
  const sourceAtom = useSourceAtom();
  return useAtom(sourceAtom);
}

export function useLayer() {
  const layerAtom = useLayerAtom();
  return useAtom(layerAtom);
}

export function useLayerValue() {
  const layerAtom = useLayerAtom();
  return useAtomValue(layerAtom);
}

export function useViewState() {
  const viewStateAtom = React.useContext(ViewStateContext);
  assert(viewStateAtom !== null, "useViewState must be used within a ViewStateContext.Provider");
  return useAtom(viewStateAtom);
}
