import { type PrimitiveAtom, useAtom } from "jotai";
import * as React from "react";
import type { LayerState, SourceData, ViewState } from "./state";

import * as utils from "./utils";

export const SourceDataContext = React.createContext<PrimitiveAtom<{ id: string } & SourceData> | null>(null);

export function useSourceData() {
  const atom = React.useContext(SourceDataContext);
  utils.assert(atom, "useSourceData hook must be used within SourceDataContext.");
  return useAtom(atom);
}

export const LayerStateContext = React.createContext<PrimitiveAtom<{ id: string } & LayerState> | null>(null);

export function useLayerState() {
  const atom = React.useContext(LayerStateContext);
  utils.assert(atom, "useLayerState hook must be used within LayerStateContext.");
  return useAtom(atom);
}

export const ViewStateContext = React.createContext<PrimitiveAtom<ViewState | null> | null>(null);

export function useViewState() {
  const atom = React.useContext(ViewStateContext);
  utils.assert(atom, "useViewState hook must be used within ViewStateContext.");
  return useAtom(atom);
}
