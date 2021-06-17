import {atom} from "../_snowpack/pkg/jotai.js";
import {atomFamily, splitAtom, waitForAll} from "../_snowpack/pkg/jotai/utils.js";
import {initLayerStateFromSource} from "./io.js";
export const DEFAULT_VIEW_STATE = {zoom: 0, target: [0, 0, 0], default: true};
export const DEFAULT_LAYER_PROPS = {
  loader: [],
  colorValues: [],
  sliderValues: [],
  contrastLimits: [],
  loaderSelection: [],
  channelIsOn: [],
  colormap: "",
  opacity: 1,
  excludeBackground: true
};
export const sourceInfoAtom = atom([]);
export const viewStateAtom = atom(DEFAULT_VIEW_STATE);
export const sourceInfoAtomAtoms = splitAtom(sourceInfoAtom);
export const layerFamilyAtom = atomFamily((param) => atom({...initLayerStateFromSource(param), id: param.id}), (a, b) => a.id === b.id);
export const layerAtoms = atom((get) => {
  const atoms = get(sourceInfoAtomAtoms);
  if (atoms.length === 0)
    return [];
  const layers = atoms.map((a) => layerFamilyAtom(get(a)));
  return get(waitForAll(layers));
});
