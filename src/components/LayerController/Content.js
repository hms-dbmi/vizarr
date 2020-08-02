import { AccordionDetails, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import OpacitySlider from './OpacitySlider';
import ChannelController from './ChannelController';

const Details = withStyles({
  root: {
    padding: '0 5px',
  },
})(AccordionDetails);

const range = (len) => [...Array(len).keys()];

function Content({ id, nChannels }) {
  return (
    <Details>
      <Grid container>
        <OpacitySlider id={id} /> 
        {range(nChannels).map(i => <ChannelController id={id} index={i} key={i + id} />)}
      </Grid>
    </Details>
  );
}

export default Content;