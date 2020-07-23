import React, { useState, useEffect } from 'react';
import DeckGL from 'deck.gl';
import { OrthographicView } from '@deck.gl/core';
import { VivViewerLayer, StaticImageLayer } from '../node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js';

import { createZarrLoader, channelsToVivProps } from '../utils';

function App() {
  const [layerProps, setLayerProps] = useState([]);

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
            return [...prev, { loader, id, colormap, opacity, ...vivProps }];
          })
        }

        api.export({ add_image });
      }
    }
    init();
  }, []); 

  const layers = layerProps.map(d => {
    const Layer = d.loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
    return new Layer(d)
  });

  const deck = (
    <DeckGL
      layers={layers}
      initialViewState={{zoom: 0, target: [0,0,0]}}
      views={new OrthographicView({ id: 'ortho', controller: true })}
    />
  )

  return (
    <>
      {layers.length > 0 ? deck : null}
    </>
  );
}

export default App;
