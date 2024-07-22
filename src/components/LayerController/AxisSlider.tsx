import { Divider, Grid, Typography } from "@material-ui/core";
import { Slider } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { useAtom, useAtomValue } from "jotai";
import * as React from "react";
import type { ChangeEvent } from "react";
import type { ControllerProps } from "../../state";
import DimensionOptions from "./AxisOptions";

const DenseSlider = withStyles({
  root: {
    color: "white",
    padding: "10px 0px 5px 0px",
    marginRight: "5px",
  },
  active: {
    boxshadow: "0px 0px 0px 8px rgba(158, 158, 158, 0.16)",
  },
})(Slider);

interface Props {
  axisIndex: number;
  max: number;
}

function AxisSlider({ sourceAtom, layerAtom, axisIndex, max }: ControllerProps<Props>) {
  const [layer, setLayer] = useAtom(layerAtom);
  const sourceData = useAtomValue(sourceAtom);
  const { axis_labels } = sourceData;
  let axisLabel = axis_labels[axisIndex];
  if (axisLabel === "t" || axisLabel === "z") {
    axisLabel = axisLabel.toUpperCase();
  }
  // state of the slider to update UI while dragging
  const [value, setValue] = React.useState(0);

  // If axis index change externally, need to update state
  React.useEffect(() => {
    // Use first channel to get initial value of slider - can be undefined on first render
    setValue(layer.layerProps.selections[0] ? layer.layerProps.selections[0][axisIndex] : 1);
  }, [layer.layerProps.selections, axisIndex]);

  const handleRelease = () => {
    setLayer((prev) => {
      let layerProps = { ...prev.layerProps };
      // for each channel, update index of this axis
      layerProps.selections = layerProps.selections.map((ch) => {
        let new_ch = [...ch];
        new_ch[axisIndex] = value;
        return new_ch;
      });
      return { ...prev, layerProps };
    });
  };

  const handleDrag = (_: ChangeEvent<unknown>, value: number | number[]) => {
    setValue(value as number);
  };

  return (
    <>
      <Grid>
        <Grid container justifyContent="space-between">
          <Grid item xs={10}>
            <div style={{ width: 165, overflow: "hidden", textOverflow: "ellipsis" }}>
              <Typography variant="caption" noWrap>
                {axisLabel}: {value}/{max}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={1}>
            <DimensionOptions sourceAtom={sourceAtom} layerAtom={layerAtom} axisIndex={axisIndex} max={max} />
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between">
          <Grid item xs={12}>
            <DenseSlider
              value={value}
              onChange={handleDrag}
              onChangeCommitted={handleRelease}
              min={0}
              max={max}
              step={1}
            />
          </Grid>
        </Grid>
      </Grid>
      <Divider />
    </>
  );
}

export default AxisSlider;
