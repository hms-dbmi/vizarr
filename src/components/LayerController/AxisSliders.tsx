import { Divider, Grid } from "@material-ui/core";
import { useAtomValue } from "jotai";
import React from "react";
import type { ControllerProps } from "../../state";
import AxisSlider from "./AxisSlider";

function AxisSliders({ sourceAtom, layerAtom }: ControllerProps) {
  return (
    <>
      <Grid>{sliders}</Grid>
      <Divider />
    </>
  );
}

export default AxisSliders;
