import { AccordionDetails, Divider, Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { useAtomValue } from "jotai";
import React from "react";

import AcquisitionController from "./AcquisitionController";
import AddChannelButton from "./AddChannelButton";
import AxisSliders from "./AxisSliders";
import ChannelController from "./ChannelController";
import OpacitySlider from "./OpacitySlider";

import type { ControllerProps } from "../../state";
import { range } from "../../utils";

const Details = withStyles({
  root: {
    padding: "2px 5px",
    borderLeft: "1px solid rgba(150, 150, 150, .2)",
    borderRight: "1px solid rgba(150, 150, 150, .2)",
  },
})(AccordionDetails);

function Content({ sourceAtom, layerAtom }: ControllerProps) {
  const layer = useAtomValue(layerAtom);
  const nChannels = layer.layerProps.selections.length;
  return (
    <Details>
      <Grid container direction="column">
        <AcquisitionController sourceAtom={sourceAtom} layerAtom={layerAtom} />
        <Grid>
          <Grid container justifyContent="space-between">
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
        <Grid container justifyContent="space-between">
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
