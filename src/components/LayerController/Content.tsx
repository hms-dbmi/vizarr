import { AccordionDetails, Divider, Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import React from "react";

import AcquisitionController from "./AcquisitionController";
import AddChannelButton from "./AddChannelButton";
import AxisSliders from "./AxisSliders";
import ChannelController from "./ChannelController";
import Labels from "./Labels";
import OpacitySlider from "./OpacitySlider";

import { useLayerState } from "../../hooks";
import { range } from "../../utils";

const Details = withStyles({
  root: {
    padding: "2px 5px",
    borderLeft: "1px solid rgba(150, 150, 150, .2)",
    borderRight: "1px solid rgba(150, 150, 150, .2)",
  },
})(AccordionDetails);

function Content() {
  const [layer] = useLayerState();
  const nChannels = layer.layerProps.selections.length;
  return (
    <Details>
      <Grid container direction="column">
        <AcquisitionController />
        <Grid>
          <Grid container justifyContent="space-between">
            <Grid item xs={3}>
              <Typography variant="caption">opacity:</Typography>
            </Grid>
            <Grid item xs={8}>
              <OpacitySlider />
            </Grid>
          </Grid>
        </Grid>
        <AxisSliders />
        <Grid container justifyContent="space-between">
          <Grid item xs={3}>
            <Typography variant="caption">channels:</Typography>
          </Grid>
          <Grid item xs={1}>
            <AddChannelButton />
          </Grid>
        </Grid>
        <Divider />
        <Grid>
          {range(nChannels).map((i) => (
            <ChannelController channelIndex={i} key={i} />
          ))}
        </Grid>
        {layer.labels?.length && (
          <>
            <Grid container justifyContent="space-between">
              <Typography variant="caption">labels:</Typography>
            </Grid>
            <Divider />
            <Grid>
              {layer.labels.map((label, i) => (
                <Labels labelIndex={i} key={label.layerProps.id} />
              ))}
            </Grid>
          </>
        )}
      </Grid>
    </Details>
  );
}

export default Content;
