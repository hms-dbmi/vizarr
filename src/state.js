import { atom, atomFamily, selector, waitForAll } from 'recoil';
import { StaticImageLayer } from '@hms-dbmi/viv';

export const DEFAULT_VIEW_STATE = { zoom: 0, target: [0, 0, 0], default: true };
export const DEFAULT_LAYER_PROPS = {
  on: true,
  colorValues: [],
  sliderValues: [],
  loaderSelection: [],
  channelIsOn: [],
  opacity: 1,
  colormap: '',
  contrastLimits: [],
  labels: [],
};

export const sourceInfoState = atom({
  key: 'sourceInfo',
  default: {},
});

export const layerIdsState = atom({
  key: 'layerIds',
  default: [],
});

export const viewerViewState = atom({
  key: 'viewerViewState',
  default: DEFAULT_VIEW_STATE,
});

export const layerStateFamily = atomFamily({
  key: 'layerStateFamily',
  default: (id) => [StaticImageLayer, { id, ...DEFAULT_LAYER_PROPS }],
});

export const layersSelector = selector({
  key: 'layerSelector',
  get: ({ get }) => {
    const layerIds = get(layerIdsState);
    const layers = layerIds.map((id) => layerStateFamily(id));
    return get(waitForAll(layers));
  },
});
