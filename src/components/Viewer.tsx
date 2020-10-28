import { useRecoilState, useRecoilValue } from 'recoil';
import DeckGL from 'deck.gl';
import { OrthographicView } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';

import { viewerViewState, layersSelector, sourceInfoState } from '../state';
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

  const sourceInfo = useRecoilValue(sourceInfoState);

  // Click handler for plate layout - opens image in new window
  const handleClick = (info: Object) => {
    let layerId = (info as any).layer.id;
    if (!layerId.includes('-plate-')){
      return;
    }
    // Get the info we need from the layerId
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const layerPropsId = layerId.split('-plate-')[0];
    const [row, col] = layerId.split('-plate-')[1].split('-').map((x: string) => parseInt(x));
    let source = (info as any).sourceLayer?.props?.source;
    const plateAcquisitions = sourceInfo[layerPropsId]?.plateAcquisitions;
    if (source && !isNaN(row) && !isNaN(col) && plateAcquisitions) {
      if (source.endsWith('/')){
        source = source.slice(0, -1);
      }
      let imgSource = `${source}/${plateAcquisitions[0]}/${letters[row]}/${col + 1}/Field_1/`;
      window.open(window.location.origin + '?source=' + imgSource);
    }
  }

  const layerConstructors = useRecoilValue(layersSelector);
  const layers = layerConstructors.flatMap((l) => {
    // Something weird with Recoil Loadable here. Need to cast to any.
    const { Layer, layerProps, on } = l as any;
    const layerInfo = sourceInfo[layerProps.id];
    const rows = layerInfo?.rows;
    const columns = layerInfo?.columns;
    const loaders = layerInfo.loaders;
    if (rows && columns && layerProps.loader && loaders) {
      const [height, width] = layerProps.loader.base.shape.slice(-2);
      const spacer = 5;
      const top = -(rows * (height + spacer)) / 2;
      const left = -(columns * (width + spacer)) / 2;
      return range(rows).flatMap((row) => {
        return range(columns).flatMap((col) => {
          const y = top + (row * (height + spacer));
          const x = left + (col * (width + spacer));
          // NB: this ID is used by onClick to get row and col
          const id = `${layerProps.id}-plate-${row}-${col}`;
          const loader = layerInfo.loaders ? layerInfo.loaders[col + (row * columns)]: undefined;
          if (!loader) {
            return [];
          }
          let wellProps = {
            ...layerProps,
            id,
            translate: [x, y],
            loader: layerInfo.loaders ? layerInfo.loaders[col + (row * columns)] : null,
            pickable: true,
            onClick: handleClick
          }
          return [new Layer(wellProps)]
        });
      })
    }
    return !Layer || !on ? [] : [new Layer(layerProps)];
  });
  return <WrappedViewStateDeck layers={layers} />;
}

export default Viewer;
