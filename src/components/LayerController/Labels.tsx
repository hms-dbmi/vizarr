import { Grid, IconButton, Slider, Typography } from "@material-ui/core";
import { RadioButtonChecked, RadioButtonUnchecked } from "@material-ui/icons";
import React from "react";

import { useLayerState, useSourceData } from "../../hooks";
import { assert } from "../../utils";

export default function Labels({ labelIndex }: { labelIndex: number }) {
  const [source] = useSourceData();
  const [layer, setLayer] = useLayerState();
  assert(source.labels && layer.kind === "multiscale" && layer.labels, "Missing image labels");

  const handleOpacityChange = (_: unknown, value: number | number[]) => {
    setLayer((prev) => {
      assert(prev.kind === "multiscale" && prev.labels, "Missing image labels");
      return {
        ...prev,
        labels: prev.labels.with(labelIndex, {
          ...prev.labels[labelIndex],
          layerProps: {
            ...prev.labels[labelIndex].layerProps,
            opacity: value as number,
          },
        }),
      };
    });
  };

  const { name } = source.labels[labelIndex];
  const label = layer.labels[labelIndex];
  return (
    <>
      <Grid container justifyContent="space-between" wrap="nowrap">
        <div style={{ width: 165, overflow: "hidden", textOverflow: "ellipsis" }}>
          <Typography variant="caption" noWrap>
            {name}
          </Typography>
        </div>
      </Grid>
      <Grid container justifyContent="space-between">
        <Grid item xs={2}>
          <IconButton
            style={{ backgroundColor: "transparent", padding: 0, zIndex: 2 }}
            onClick={() => {
              setLayer((prev) => {
                assert(prev.kind === "multiscale" && prev.labels, "Missing image labels");
                return {
                  ...prev,
                  labels: prev.labels.with(labelIndex, {
                    ...prev.labels[labelIndex],
                    on: !prev.labels[labelIndex].on,
                  }),
                };
              });
            }}
          >
            {label.on ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
          </IconButton>
        </Grid>
        <Grid item xs={10}>
          <Slider
            value={label.layerProps.opacity}
            onChange={handleOpacityChange}
            min={0}
            max={1}
            step={0.01}
            style={{ padding: "10px 0px 5px 0px" }}
          />
        </Grid>
      </Grid>
    </>
  );
}
