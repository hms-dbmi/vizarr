import { useRecoilValue } from 'recoil';

import { layerIdsState } from '../state/atoms';
import LayerController from './LayerController';

function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  return (
    <div style={{
      backgroundColor: 'black', 
      borderRadius: 2,
      opacity: 0.7,
      position: "absolute",
      zIndex: 2, 
    }}>
      {layerIds.map(id => <LayerController id={id} key={id}/>)}
    </div>
  ) 
}

export default Menu;
