import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { StaticImageLayer, VivViewerLayer } from '../node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js';

import { sourceInfoState, layerStateFamily, viewerViewState } from '../state/atoms';
import { createZarrLoader, channelsToVivProps } from '../utils';

function LayerController({ id }) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const setLayer = useSetRecoilState(layerStateFamily(id));

  useEffect(() => {
    async function initLayer({ source, dimensions, channels, colormap = '', opacity = 1 }) {
      const loader = await createZarrLoader(source, dimensions);
      const vivProps = channelsToVivProps(channels);
      const Layer = loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
      return [Layer, { id, loader, colormap, opacity, ...vivProps }];
    }

    if (id in sourceInfo) {
      const layerInfo = sourceInfo[id];
      initLayer(layerInfo).then(l => setLayer(l));
    }

  }, [sourceInfo])

  return null;
}

export default LayerController;
