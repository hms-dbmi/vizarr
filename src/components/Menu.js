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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '5px',
        padding: `0px 5px ${hidden ? 0 : 5}px 5px`,
        left: '5px',
        top: '5px',
        maxHeight: 500,
        overflowX: 'hidden',
        overflowY: 'scroll'
      }}
    >
      <Grid 
        container 
        direction="column" 
        alignItems="flex-start"
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
        <Grid 
          container
          direction="column"
          style={{ 
            display: hidden ? 'none' : 'flex', 
          }}
        > 
          {layerIds.map(id => <LayerController id={id} key={id} />)}
        </Grid>
      </Grid>
    </div>
  ) 
}

export default Menu;