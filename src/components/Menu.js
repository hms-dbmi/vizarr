import { useReducer } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components'
import { Plus, Minus } from '@styled-icons/entypo'

import { layerIdsState } from '../state';
import LayerController from './LayerController';

const Container = styled.div`
  background-color: rgba(50, 50, 50, 0.7);
  position: absolute;
  right: 5px;
  z-index: 1;
  padding: 0 0.3em;
  border-radius: 0.5em;
  display: flex;
  flex-direction: column;
`;

const MenuPanel = styled.div`
  display: ${props => props.hidden ? 'none' : 'flex'}
  flex-direction: column;
`;

const IconButton = styled.button`
  background-color: Transparent;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  width: 35px;
  color: white;
  align-self: flex-end;
`;

function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  const [hidden, toggle] = useReducer(v => !v, false);
  return (
    <Container>
      <IconButton onClick={toggle}>{hidden ? <Plus/> : <Minus/>}</IconButton>
      <MenuPanel hidden={hidden}>
        {layerIds.map(id => <LayerController id={id} key={id} />)}
      </MenuPanel>
    </Container>
  ) 
}

export default Menu;
