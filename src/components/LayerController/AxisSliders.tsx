import React from 'react';
import { Grid, Divider } from '@material-ui/core';
import { useAtomValue } from 'jotai';
import AxisSlider from './AxisSlider';
import type { ControllerProps } from '../../state';

function AxisSliders({ sourceAtom, layerAtom }: ControllerProps) {
  const sourceData = useAtomValue(sourceAtom);
  const { axis_labels, channel_axis, loader } = sourceData;

  const sliders = axis_labels
    .slice(0, -2) // ignore last two axes, [y,x]
    .map((name, i): [string, number, number] => [name, i, loader[0].shape[i]]) // capture the name, index, and size of non-yx dims
    .filter((d) => {
      if (d[1] === channel_axis) return false; // ignore channel_axis (for OME-Zarr channel_axis === 1)
      if (d[2] > 1) return true; // keep if size > 1
      return false; // otherwise ignore as well
    })
    .map(([name, i, size]) => (
      <AxisSlider key={name} sourceAtom={sourceAtom} layerAtom={layerAtom} axisIndex={i} max={size - 1} />
    ));

  if (sliders.length === 0) return null;
  return (
    <>
      <Grid>{sliders}</Grid>
      <Divider />
    </>
  );
}

export default AxisSliders;
