import React, { useState, useEffect } from 'react';
import DeckGL from 'deck.gl';
import { OrthographicView } from '@deck.gl/core';
import { VivViewerLayer, StaticImageLayer } from '../node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js';

import { createZarrLoader, channelsToVivProps } from '../utils';

const DEFAULT_VIEW_STATE = { zoom: 0, target: [0, 0, 0] };

function App() {
  const [layerProps, setLayerProps] = useState([]);
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);

  useEffect(() => {
    async function init() {
      // enable imjoy api when loaded as an iframe
      if (window.self !== window.top) {
        const { setupRPC } = await import('imjoy-rpc');
        const api = await setupRPC({ name: "vitessce-image-viewer-plugin" });

        async function add_image({ source, channels, dimensions, colormap = null, opacity = 1 }) {
          const loader = await createZarrLoader(source, dimensions);
          loader.dtype = "<" + loader.dtype.slice(1); // internal Viv bug, coerce all dtype strings to "littleEndian"
          const vivProps = channelsToVivProps(channels);
          const id = Math.random().toString()
          setLayerProps(prev => {
            if (prev.length === 0) {
              // If there are no layers, use the first image to determine initial view state
              const [height, width] = loader.base.shape.slice(-2);
              setViewState(prevViewState => {
                // Only override view state if it's the default
                if (JSON.stringify(prevViewState) === JSON.stringify(DEFAULT_VIEW_STATE)) {
                  return { zoom: -loader.numLevels, target: [width/2, height/2, 0]};
                }
                return prevViewState;
              });
            }
            return [...prev, { loader, id, colormap, opacity, ...vivProps }]
          });
        }

        async function set_view_state(nextViewState) {
          setViewState(nextViewState)
        }

        api.export({ add_image, set_view_state });
      }
    }
    init();
  }, []); 

  const layers = layerProps.map(d => {
    const Layer = d.loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
    return new Layer(d)
  });

  return (
    <DeckGL
      layers={layers}
      viewState={viewState}
      onViewStateChange={e => setViewState(e.viewState)}
      views={new OrthographicView({ id: 'ortho', controller: true })}
    />
  );
}

export default App;
