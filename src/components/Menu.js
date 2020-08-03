import { useReducer } from 'react';
import { useRecoilValue } from 'recoil';
import { Grid, IconButton } from '@material-ui/core';
import { Add, Remove } from '@material-ui/icons';

import { layerIdsState } from '../state';
import LayerController from './LayerController';

function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  const [hidden, toggle] = useReducer(v => !v, false);
  return (
    <div 
      style={{ 
        zIndex: 1, 
        position: 'absolute', 
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderRadius: '5px',
        padding: `0px 5px ${hidden ? 0 : 5}px 5px`,
        right: '5px',
        top: '5px',
      }}
    >
      <Grid 
        container 
        direction="column" 
        alignItems="flex-end"
      >
        <IconButton 
          style={{ 
            backgroundColor: 'transparent',
            padding: 0,
          }} 
          onClick={toggle}
        >
          {hidden ? <Add /> : <Remove />}
        </IconButton>
        <Grid container direction="column" style={{ display: hidden ? 'none' : 'flex' }}>
          {layerIds.map(id => <LayerController id={id} key={id} />)}
        </Grid>
      </Grid>
    </div>
  ) 
}

export default Menu;