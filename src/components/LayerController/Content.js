import { AccordionDetails, Grid, Typography, Divider } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import OpacitySlider from './OpacitySlider';
import ChannelController from './ChannelController';

import { range } from '../../utils';

const Details = withStyles({
  root: {
    padding: '2px 5px',
    borderLeft: '1px solid rgba(150, 150, 150, .2)',
    borderRight: '1px solid rgba(150, 150, 150, .2)',
  },
})(AccordionDetails);

function Content({ id, nChannels }) {
  return (
    <Details>
      <Grid container direction="column">
        <Grid>
          <Grid container justify="space-between">
            <Grid item xs={3}>
              <Typography variant="caption">opacity:</Typography>
            </Grid>
            <Grid xs={8}>
              <OpacitySlider id={id} />
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <Grid>
          {range(nChannels).map((i) => (
            <ChannelController id={id} channelIndex={i} key={i + id} />
          ))}
        </Grid>
      </Grid>
    </Details>
  );
}

export default Content;
