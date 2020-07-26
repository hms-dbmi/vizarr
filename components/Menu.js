import { useRecoilValue } from 'recoil';

import { layerIdsState } from '../state/atoms';
import LayerController from './LayerController';

function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  return (
    <>
      {layerIds.map(id => <LayerController id={id} key={id}/>)}
    </>
  ) 
}

export default Menu;
