import { atom, atomFamily, selector, waitForAll } from 'recoil';
import { StaticImageLayer } from '../node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js';

export const DEFAULT_VIEW_STATE = { zoom: 0, target: [0, 0, 0], default: true };
export const DEFAULT_LAYER_PROPS = {
  colorValues: [],
  sliderValues: [], 
  loaderSelection: [],
  channelIsOn: [],
  opacity: 1,
  colormap: '',
}

export const sourceInfoState = atom({
  key: 'sourceInfo',
  default: {},
});

export const layerIdsState = atom({
  key: 'layerIds',
  default: [],
})

export const viewerViewState = atom({
  key: 'viewerViewState',
  default: DEFAULT_VIEW_STATE,
});

export const layerStateFamily = atomFamily({
  key: 'layerStateFamily',
  default: id => [StaticImageLayer, { id, ...DEFAULT_LAYER_PROPS }],
});
