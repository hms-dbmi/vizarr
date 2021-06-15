import React from 'react';
import { useAtomValue } from 'jotai/utils';
import { AccordionDetails, Grid, Typography, Divider } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import AcquisitionController from './AcquisitionController';
import AddChannelButton from './AddChannelButton';
import OpacitySlider from './OpacitySlider';
import AxisSliders from './AxisSliders';
import ChannelController from './ChannelController';

import { range } from '../../utils';
import type { ControllerProps } from '../../state';

const Details = withStyles({
  root: {
    padding: '2px 5px',
    borderLeft: '1px solid rgba(150, 150, 150, .2)',
    borderRight: '1px solid rgba(150, 150, 150, .2)',
  },
})(AccordionDetails);

function Content({ sourceAtom, layerAtom }: ControllerProps) {
  const layer = useAtomValue(layerAtom);
  const nChannels = layer.layerProps.loaderSelection.length;
  return (
    <Details>
      <Grid container direction="column">
        <AcquisitionController sourceAtom={sourceAtom} layerAtom={layerAtom} />
        <Grid>
          <Grid container justify="space-between">
            <Grid item xs={3}>
              <Typography variant="caption">opacity:</Typography>
            </Grid>
            <Grid item xs={8}>
              <OpacitySlider sourceAtom={sourceAtom} layerAtom={layerAtom} />
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <AxisSliders sourceAtom={sourceAtom} layerAtom={layerAtom} />
        <Grid container justify="space-between">
          <Grid item xs={3}>
            <Typography variant="caption">channels:</Typography>
          </Grid>
          <Grid item xs={1}>
            <AddChannelButton sourceAtom={sourceAtom} layerAtom={layerAtom} />
          </Grid>
        </Grid>
        <Divider />
        <Grid>
          {range(nChannels).map((i) => (
            <ChannelController sourceAtom={sourceAtom} layerAtom={layerAtom} channelIndex={i} key={i} />
          ))}
        </Grid>
      </Grid>
    </Details>
  );
}

export default Content;
