import { useEffect, useReducer } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import styled from 'styled-components';
import { Eye, EyeWithLine } from '@styled-icons/entypo';
import { StaticImageLayer, VivViewerLayer } from '@hms-dbmi/viv';

import { sourceInfoState, layerStateFamily }from '../state';
import { createZarrLoader, channelsToVivProps, OMEMetaToVivProps } from '../utils';

const Container = styled.div`
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: white;
  font-size: 0.75em;
  border-radius: 0.3em;
  overflow: hidden;
  background-color: rgba(50, 50, 50, 0.7);
  margin-bottom: 0.2em;
  padding: 0.3em;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  cursor: pointer;
  transition: 0.4s;
  &:hover {
    background-color: rgba(50, 50, 50, 1);
  }
`;

const Name = styled.span`
  font-size: 12px;
  background: transparent;
  font-weight: bold;
  max-width: 150px;
`;

const IconButton = styled.button`
  background-color: Transparent;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  width: 35px;
  color: ${props => props.visible ? 'white' : 'gray'};
`;

const Panel = styled.div`
  max-height: ${props => props.open ? '200px' : '0px'};
  overflow: hidden;
  transition: max-height 0.2s ease-out;
`;

function OpacitySlider({ id }) {
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

function HideButton({ id }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = (e) => {
    e.stopPropagation();
    setLayer(([prevLayer, prevProps]) => {
      const on = !prevProps.on;
      return [prevLayer, {...prevProps, on }];
    });
  }
  const { on } = layer[1];
  return (
    <IconButton onClick={handleChange} visible={on}>
      {on ? <Eye/> : <EyeWithLine/>}
    </IconButton>
  );
}

function ContrastSlider({ id, index, max = 60000 }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = e => {
    const value = +e.target.value;
    setLayer(([prevLayer, prevProps]) => {
      const sliderValues = [...prevProps.sliderValues];
      sliderValues[index] = [0, value];
      return [prevLayer, {...prevProps, sliderValues }];
    });
  }
  const inputId = `contrast-limit-${id}-${index}`;
  return (
    <Row>
      <label for={inputId}>color:</label>
      <input
        id={inputId}
        value={layer[1].sliderValues[index][1]}
        onChange={handleChange}
        type="range"
        min="0"
        max={max}
        step="1"
      />
    </Row>
  );
}


function LayerController({ id }) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [open, toggle] = useReducer(v => !v, true);
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));

  useEffect(() => {
    async function initLayer({
      source,
      dimensions,
      channels,
      colormap = '',
      opacity = 1,
      on = true,
    }) {
      const { loader, metadata = null } = await createZarrLoader(source, dimensions);
      // Internal viv issue, this is a hack to get the appropriate WebGL textures.
      // Loader dtypes only have littleendian lookups, but all loaders return little endian
      // regardless of source.
      loader.dtype = '<' + loader.dtype.slice(1);
      // If there is metadata (from OME-Zarr) and no channels, parse the source info. Otherwise override.
      const vivProps = metadata && !channels ?
        OMEMetaToVivProps(metadata) :
        channelsToVivProps(channels);
      const Layer = loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
      return [Layer, { id, on, loader, colormap, opacity, ...vivProps }];
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
  const { loaderSelection } = layerProps;
  return (
    <Container>
      <Header onClick={toggle}>
        <HideButton id={id}/>
        <Name>{name}</Name>
      </Header>
      <Panel open={open}>
        <OpacitySlider id={id} /> 
        {loaderSelection.map((_, i) => <ContrastSlider id={id} index={i} key={i + id} />)}
      </Panel> 
    </Container>
  );
}

export default LayerController;
