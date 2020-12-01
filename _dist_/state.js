import {atom, atomFamily, selector, waitForAll} from "../web_modules/recoil.js";
export const DEFAULT_VIEW_STATE = {zoom: 0, target: [0, 0, 0], default: true};
export const DEFAULT_LAYER_PROPS = {
  loader: void 0,
  colorValues: [],
  sliderValues: [],
  contrastLimits: [],
  loaderSelection: [],
  channelIsOn: [],
  colormap: "",
  opacity: 1
};
export const sourceInfoState = atom({
  key: "sourceInfo",
  default: {}
});
export const layerIdsState = atom({
  key: "layerIds",
  default: []
});
export const viewerViewState = atom({
  key: "viewerViewState",
  default: DEFAULT_VIEW_STATE
});
export const layerStateFamily = atomFamily({
  key: "layerStateFamily",
  default: (id) => ({
    Layer: null,
    layerProps: {id, ...DEFAULT_LAYER_PROPS},
    on: false
  })
});
export const layersSelector = selector({
  key: "layerSelector",
  get: ({get}) => {
    const layerIds = get(layerIdsState);
    const layers = layerIds.map((id) => layerStateFamily(id));
    return get(waitForAll(layers));
  }
});
