import { useReducer } from 'react';
import { useRecoilValue } from 'recoil';
import { Grid, IconButton } from '@material-ui/core';
import { Add, Remove } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import { layerIdsState } from '../state';
import LayerController from './LayerController';

const useStyles = makeStyles({
  root: {
    zIndex: 1,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '5px',
    left: '5px',
    top: '5px',
  },
  scroll: {
    maxHeight: 500,
    overflowX: 'hidden',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
      background: 'transparent',
    },
    scrollbarWidth: 'none',
    flexDirection: 'column',
  },
});

function Menu(): JSX.Element {
  const layerIds = useRecoilValue(layerIdsState);
  const [hidden, toggle] = useReducer((v) => !v, false);
  const classes = useStyles();
  return (
    <div className={classes.root} style={{ padding: `0px 5px ${hidden ? 0 : 5}px 5px` }}>
      <Grid container direction="column" alignItems="flex-start">
        <IconButton
          style={{
            backgroundColor: 'transparent',
            padding: 0,
          }}
          onClick={toggle}
        >
          {hidden ? <Add /> : <Remove />}
        </IconButton>
        <div className={classes.scroll} style={{ display: hidden ? 'none' : 'flex' }}>
          {layerIds.map((id) => (
            <LayerController layerId={id} key={id} />
          ))}
        </div>
      </Grid>
    </div>
  );
}

export default Menu;
