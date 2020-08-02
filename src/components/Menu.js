import { useReducer } from 'react';
import { useRecoilValue } from 'recoil';
import { Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { layerIdsState } from '../state';
import LayerController from './LayerController';

const useStyles = makeStyles({
  root: {
    zIndex: 1,
    maxWidth: 200,
  }
});

function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  const [hidden, toggle] = useReducer(v => !v, false);
  const classes = useStyles();
  return (
    <Box>
      <Grid container direction="column">
        <div className={classes.root}>
          {layerIds.map(id => <LayerController id={id} key={id} />)}
        </div>
      </Grid>
    </Box>
  ) 
}

export default Menu;