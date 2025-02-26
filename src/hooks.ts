import { type PrimitiveAtom, useAtom } from "jotai";
import * as React from "react";
import type { LayerState, SourceData } from "./state";

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
