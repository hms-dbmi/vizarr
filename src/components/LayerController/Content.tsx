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
    </Details>
  );
}

export default Content;
