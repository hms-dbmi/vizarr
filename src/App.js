import React, { useState, useEffect } from 'react';
import { setupRPC } from 'imjoy-rpc';
import './App.css';

import DeckGL from 'deck.gl';
import { OrthographicView } from '@deck.gl/core';
import { VivViewerLayer, StaticImageLayer } from '@hubmap/vitessce-image-viewer';
import { createZarrLoader } from './utils';

function asVivProps(channels) {
  const sliderValues = [];
  const colorValues = []; 
  const channelIsOn = [];
  const loaderSelection = [];
  for (let { color = [255, 255, 255], slider, selection, on = true } of channels) {
    sliderValues.push(slider);
    colorValues.push(color);
    channelIsOn.push(on);
    loaderSelection.push(selection);
  }
  return { sliderValues, colorValues, channelIsOn, loaderSelection }
}

function App() {
  const [layerProps, setLayerProps] = useState([]);
  const [viewState, setViewState] = useState({});
  const [count, setCount] = useState(0);
  const [cb, setCb] = useState(null);

  useEffect(() => {
    if (typeof cb === "function") cb();
  }, [count, cb]);

  useEffect(() => {
    async function init() {
      // enable imjoy api when loaded as an iframe
      if (window.self !== window.top) {
        const api = await setupRPC({ name: "vitessce-image-viewer-plugin" });
        async function add_image({ 
          source, 
          channels, 
          initialViewState: nextViewState,
          colormap = "",
          opacity = 1
        }) {
          const loader = await createZarrLoader(source);
          setLayerProps(prev => [
            ...prev, 
            { loader, colormap, opacity, ...asVivProps(channels) }
          ]);
          if (nextViewState) setViewState(nextViewState);
        }
        async function set_cb(obj) {
          console.log(obj);
          setCb(obj);
        }
        async function get_count() {
          return count
        }
        api.export({ add_image, set_cb, get_count });
      }
    }
    init();
  }, []);

  const layers = layerProps.map(d => {
    const Layer = d.loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
    return new Layer(d)
  });

  const view = new OrthographicView({ id: 'ortho', controller: true });
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Click Me</button>
      <DeckGL
        layers={layers}
        views={view}
        viewState={viewState}
        onViewStateChange={e => setViewState(e.viewState)}
      />
    </>
  );
}

export default App;
