import { AccordionDetails, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import OpacitySlider from './OpacitySlider';
import ChannelController from './ChannelController';

const Details = withStyles({
  root: {
    padding: '0px 7px',
  },
})(AccordionDetails);

const range = (len) => [...Array(len).keys()];

function Content({ id, nChannels }) {
  return (
    <Details>
      <Grid container direction='column'>
        <Grid item>
          <Grid container justify='space-between'>
            <Grid item xs={3}>
              <Typography variant='caption'>opacity:</Typography>
            </Grid>
            <Grid xs={8}>
              <OpacitySlider id={id} /> 
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {range(nChannels).map(i => <ChannelController id={id} index={i} key={i + id} />)}
        </Grid>
      </Grid>
    </Details>
  );
}

export default Content;