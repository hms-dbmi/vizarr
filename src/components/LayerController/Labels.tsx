import { Divider, Typography } from "@material-ui/core";
import { Slider } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import React from "react";

import { useLayerState, useSourceData } from "../../hooks";
import { assert } from "../../utils";

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
  const { opacity } = layer.labels[labelIndex].layerProps;
  return (
    <>
      <Divider />
      <Typography variant="caption">{name}</Typography>
      <DenseSlider value={opacity} onChange={handleOpacityChange} min={0} max={1} step={0.01} />
    </>
  );
}
