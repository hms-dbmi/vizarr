import { useReducer } from 'react';
import { useRecoilValue } from 'recoil';
import { Grid } from '@material-ui/core';

import { layerIdsState } from '../state';
import LayerController from './LayerController';

function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  const [hidden, toggle] = useReducer(v => !v, false);
  return (
    <div style={{ zIndex: 2, maxWidth: 200, position: 'absolute'}}>
      <Grid 
        container 
        direction="column" 
      >
        {layerIds.map(id => <LayerController id={id} key={id} />)}
      </Grid>
    </div>
  ) 
}

export default Menu;