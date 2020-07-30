import { useRecoilValue } from 'recoil';
import styled from 'styled-components'

import { layerIdsState } from '../state';
import LayerController from './LayerController';


const Container = styled.div`
  background-color: rgba(50, 50, 50, 0.7);
  padding: 0.3em 0.3em;
  border-radius: 0.5em;
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 1;
`;


function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  return (
    <Container>
      {layerIds.map(id => <LayerController id={id} key={id} />)}
    </Container>
  ) 
}

export default Menu;
