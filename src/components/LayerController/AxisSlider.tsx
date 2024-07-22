import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import DimensionOptions from "./AxisOptions";
import { useLayer, useSourceValue } from "@/hooks";
import { Slider } from "@/components/ui/slider";

interface Props {
  axisIndex: number;
  max: number;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function AxisSlider({ axisIndex, max }: Props) {
  const sourceData = useSourceValue();
  const [layer, setLayer] = useLayer();
  const { axis_labels } = sourceData;
  const axisLabel = capitalize(axis_labels[axisIndex]);

  // state of the slider to update UI while dragging
  const [value, setValue] = React.useState(0);

  // If axis index change externally, need to update state
  React.useEffect(() => {
    // Use first channel to get initial value of slider - can be undefined on first render
    setValue(layer.layerProps.selections[0] ? layer.layerProps.selections[0][axisIndex] : 1);
  }, [layer.layerProps.selections, axisIndex]);

  let id = `axis-${axisIndex}-${sourceData.id}-slider`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <label htmlFor={id} className="text-xs w-52 ellipsis">
          {axisLabel}: {value}/{max}
        </label>
        <DimensionOptions axisIndex={axisIndex} max={max} />
      </div>
      <Slider
        id={id}
        value={[value]}
        onValueChange={([update]) => setValue(update)}
        onValueCommit={([update]) => {
          setLayer((prev) => {
            let layerProps = { ...prev.layerProps };
            // for each channel, update index of this axis
            layerProps.selections = layerProps.selections.map((ch) => {
              return ch.with(axisIndex, update);
            });
            return { ...prev, layerProps };
          });
        }}
        min={0}
        max={max}
        step={1}
      />
    </div>
  );
}

export default AxisSlider;
