import { selector, waitForAll } from 'recoil';
import { layerIdsState, layerStateFamily } from './atoms';

export const layersSelector = selector({
  key: 'layerSelector',
  get: ({ get }) => {
    const layerIds = get(layerIdsState);
    const layers = layerIds.map(id => layerStateFamily(id));
    return get(waitForAll(layers));
  }
});