import { useRecoilState, useRecoilValue } from 'recoil';
import DeckGL from 'deck.gl';
import { OrthographicView } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';

import { viewerViewState, layersSelector } from '../state';
import { range } from '../utils';
import type { VivLayerProps, ZarrLoader } from 'viv';

function WrappedViewStateDeck({ layers }: { layers: Layer<VivLayerProps>[] }): JSX.Element {
  const [viewState, setViewState] = useRecoilState(viewerViewState);

  // If viewState hasn't been updated, use the first loader to guess viewState
  // TODO: There is probably a better place / way to set the intital view and this is a hack.
  if (viewState?.default && (layers[0]?.props as VivLayerProps)?.loader?.base) {
    const loader = (layers[0].props as VivLayerProps).loader as ZarrLoader;
    const [height, width] = loader.base.shape.slice(-2);
    const zoom = -loader.numLevels;
    const target = [width / 2, height / 2, 0];
    setViewState({ zoom, target });
  }

  const views = [new OrthographicView({ id: 'ortho', controller: true })];

  return (
    <DeckGL layers={layers} viewState={viewState} onViewStateChange={(e) => setViewState(e.viewState)} views={views} />
  );
}

function Viewer(): JSX.Element {
  const layerConstructors = useRecoilValue(layersSelector);
  const layers = layerConstructors.flatMap((l) => {
    // Something weird with Recoil Loadable here. Need to cast to any.
    const { Layer, layerProps, on } = l as any;
    if (layerProps.rows && layerProps.columns) {
      const [height, width] = layerProps.loader.base.shape.slice(-2);
      const spacer = 5;
      const top = -(layerProps.rows * (height + spacer)) / 2;
      const left = -(layerProps.columns * (width + spacer)) / 2;
      return range(layerProps.rows).flatMap((row) => {
        return range(layerProps.columns).map((col) => {
          const y = top + (row * (height + spacer));
          const x = left + (col * (width + spacer));
          const id = `${layerProps.id}-plate-${x}-${y}`;
          let wellProps = {...layerProps, id, translate: [x, y], loader: layerProps.loaders[col + (row * layerProps.columns)]}
          // Try to add hover handling - Not working! - NB: Also, onClick not supported by viv/ImageLayer
          wellProps.pickable = true;
          wellProps.onHover = (info => {console.log('hover', info)});
          return new Layer(wellProps)
        });
      })
    }
    return !Layer || !on ? [] : [new Layer(layerProps)];
  });
  return <WrappedViewStateDeck layers={layers} />;
}

export default Viewer;
