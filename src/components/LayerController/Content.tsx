import { AccordionDetails, Grid, Typography, Divider } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import AddChannelButton from './AddChannelButton';
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

function Content({ layerId, nChannels }: { layerId: string; nChannels: number }): JSX.Element {
  return (
    <Details>
      <Grid container direction="column">
        <Grid>
          <Grid container justify="space-between">
            <Grid item xs={3}>
              <Typography variant="caption">opacity:</Typography>
            </Grid>
            <Grid item xs={8}>
              <OpacitySlider layerId={layerId} />
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <Grid container justify="space-between">
          <Grid item xs={3}>
            <Typography variant="caption">channels:</Typography>
          </Grid>
          <Grid item xs={1}>
            <AddChannelButton layerId={layerId} />
          </Grid>
        </Grid>
        <Divider />
        <Grid>
          {range(nChannels).map((i) => (
            <ChannelController layerId={layerId} channelIndex={i} key={i + layerId} />
          ))}
        </Grid>
      </Grid>
    </Details>
  );
}

export default Content;
