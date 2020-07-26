import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { StaticImageLayer, VivViewerLayer } from '../node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js';

import { sourceInfoState, layerStateFamily }from '../state/atoms';
import { createZarrLoader, channelsToVivProps } from '../utils';

const OpacitySlider = ({ id }) => {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = (e) => {
    const opacity = +e.target.value;
    setLayer(([prevLayer, prevProps]) => [prevLayer, {...prevProps, opacity }])
  }
  return <input 
    value={layer[1].opacity}
    onChange={handleChange}
    type="range" 
    min="0" 
    max="1" 
    step="0.01" 
  />
}

const ContrastLimitSlider = ({ id, index }) => {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = (v) => {
    setLayer(([prevLayer, prevProps]) => {
      const sliderValues = prevProps.sliderValues;
      sliderValues[index] = v;
      return [prevLayer, {...prevProps, sliderValues }]
    });
  }
  const value = layer.sliderValues[index];
  // TODO
}

const VisibilityButton = ({ id, index }) => {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  // TODO
}

const ColorSelector = ({ id, index }) => {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  // TODO
}

function LayerController({ id }) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));

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

  // If layer hasn't been initialized, don't render control.
  const layerProps = layer[1];
  if (!layerProps?.loader) return null;

  return (
    <OpacitySlider id={id} />
  );
}

export default LayerController;
