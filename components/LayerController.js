import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import styled from 'styled-components';
import { StaticImageLayer, VivViewerLayer } from '../node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js';

import { sourceInfoState, layerStateFamily }from '../state/atoms';
import { createZarrLoader, channelsToVivProps } from '../utils';

const Container = styled.div`
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: white;
  font-size: 0.75em;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Name = styled.span`
  font-size: 1em;
  font-weight: bold;
`

const OpacitySlider = ({ id }) => {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = e => {
    const opacity = +e.target.value;
    setLayer(([prevLayer, prevProps]) => [prevLayer, {...prevProps, opacity }])
  }
  const inputId = `opacity-${id}`;
  return (
    <Row>
      <label for={inputId}>opacity:</label>
      <input
        id={inputId}
        value={layer[1].opacity}
        onChange={handleChange}
        type="range"
        min="0"
        max="1"
        step="0.01"
      />
    </Row>
  )
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

  const { name } = sourceInfo[id];
  return (
    <Container>
      <Name>{name}</Name>
      <OpacitySlider id={id} />
    </Container>
  );
}

export default LayerController;
