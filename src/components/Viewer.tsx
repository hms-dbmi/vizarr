import React, { useRef } from 'react';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import DeckGL from 'deck.gl';
import { OrthographicView, Position, RGBAColor } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';

import type { LayerState, PolyGon } from '../state';
import { layerAtoms, viewStateAtom, polygonsAtom } from '../state';
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

function WrappedViewStateDeck({ layers }: { layers: Layer<any, any>[] }) {
  const [viewState, setViewState] = useAtom(viewStateAtom);
  const deckRef = useRef<DeckGL>(null);

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
      views={[new OrthographicView({ id: 'ortho', controller: true })]}
    />
  );
}

function Viewer() {
  const layerConstructors = useAtomValue(layerAtoms);
  const polygons: PolyGon[] = useAtomValue(polygonsAtom);
  const layers = layerConstructors.map((layer) => {
    return !layer.on ? null : new layer.Layer(layer.layerProps);
  }) as Layer<any, any>[];

  if (polygons.length > 0) {
    const polygonsLayer = new PolygonLayer({
      id: 'polygon-layer',
      data: polygons,
      stroked: true,
      filled: false,
      wireframe: true,
      getPolygon: (d) => (d as PolyGon)["path"] as Position[],
      getLineColor: (d) => (d as PolyGon)["strokeColor"] as RGBAColor,
      getLineWidth: 1,
    });
    layers.push(polygonsLayer);
  }
  return <WrappedViewStateDeck layers={layers} />;
}

export default Viewer;
