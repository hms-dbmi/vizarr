import React, { useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import DeckGL from 'deck.gl';
import { OrthographicView } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';

import { viewerViewState, layersSelector, LayerState } from '../state';
import { isInterleaved, fitBounds } from '../utils';

function getLayerSize(props: LayerState['layerProps']) {
  const { loader, rows, columns } = props;
  const [base, maxZoom] = Array.isArray(loader) ? [loader[0], loader.length] : [loader, 0];
  const interleaved = isInterleaved(base.shape);
  let [height, width] = base.shape.slice(interleaved ? -3 : -2);
  if (rows && columns) {
    // TODO: Don't hardcode spacer size. Probably best to inspect the deck.gl Layers rather than
    // the Layer Props.
    const spacer = 5;
    height = (height + spacer) * rows;
    width = (width + spacer) * columns;
  }
  return { height, width, maxZoom };
}

function WrappedViewStateDeck({ layers }: { layers: Layer<any, any>[] }): JSX.Element {
  const [viewState, setViewState] = useRecoilState(viewerViewState);
  const deckRef = useRef<DeckGL>(null);
  const views = [new OrthographicView({ id: 'ortho', controller: true })];

  // If viewState hasn't been updated, use the first loader to guess viewState
  // TODO: There is probably a better place / way to set the intital view and this is a hack.
  if (deckRef.current && viewState?.default && layers[0]?.props?.loader) {
    const { deck } = deckRef.current;
    const { width, height, maxZoom } = getLayerSize(layers[0].props);
    const padding = deck.width < 400 ? 10 : deck.width < 600 ? 30 : 50; // Adjust depending on viewport width.
    const { zoom, target } = fitBounds([width, height], [deck.width, deck.height], maxZoom, padding);
    setViewState({ zoom, target });
  }

  return (
    <DeckGL
      ref={deckRef}
      layers={layers}
      viewState={viewState}
      onViewStateChange={(e) => setViewState(e.viewState)}
      views={views}
    />
  );
}

function Viewer(): JSX.Element {
  const layerConstructors = useRecoilValue(layersSelector);
  const layers = layerConstructors.map((l) => {
    // Something weird with Recoil Loadable here. Need to cast to any.
    const { Layer, layerProps, on } = l as any;
    return !Layer || !on ? null : new Layer(layerProps);
  });
  return <WrappedViewStateDeck layers={layers} />;
}

export default Viewer;
