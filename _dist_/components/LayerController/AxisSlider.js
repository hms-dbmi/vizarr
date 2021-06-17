import {Grid, Typography, Divider} from "../../../_snowpack/pkg/@material-ui/core.js";
import {useAtom} from "../../../_snowpack/pkg/jotai.js";
import {useAtomValue} from "../../../_snowpack/pkg/jotai/utils.js";
import React, {useState, useEffect} from "../../../_snowpack/pkg/react.js";
import {Slider} from "../../../_snowpack/pkg/@material-ui/core.js";
import {withStyles} from "../../../_snowpack/pkg/@material-ui/styles.js";
import DimensionOptions from "./AxisOptions.js";
const DenseSlider = withStyles({
  root: {
    color: "white",
    padding: "10px 0px 5px 0px",
    marginRight: "5px"
  },
  active: {
    boxshadow: "0px 0px 0px 8px rgba(158, 158, 158, 0.16)"
  }
})(Slider);
function AxisSlider({sourceAtom, layerAtom, axisIndex, max}) {
  const [layer, setLayer] = useAtom(layerAtom);
  const sourceData = useAtomValue(sourceAtom);
  const {axis_labels} = sourceData;
  let axisLabel = axis_labels[axisIndex];
  if (axisLabel === "t" || axisLabel === "z") {
    axisLabel = axisLabel.toUpperCase();
  }
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(layer.layerProps.loaderSelection[0] ? layer.layerProps.loaderSelection[0][axisIndex] : 1);
  }, [layer.layerProps.loaderSelection]);
  const handleRelease = () => {
    setLayer((prev) => {
      let layerProps = {...prev.layerProps};
      layerProps.loaderSelection = layerProps.loaderSelection.map((ch) => {
        let new_ch = [...ch];
        new_ch[axisIndex] = value;
        return new_ch;
      });
      return {...prev, layerProps};
    });
  };
  const handleDrag = (_, value2) => {
    setValue(value2);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Grid, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justify: "space-between"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 10
  }, /* @__PURE__ */ React.createElement("div", {
    style: {width: 165, overflow: "hidden", textOverflow: "ellipsis"}
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption",
    noWrap: true
  }, axisLabel, ": ", value, "/", max))), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 1
  }, /* @__PURE__ */ React.createElement(DimensionOptions, {
    sourceAtom,
    layerAtom,
    axisIndex,
    max
  }))), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justify: "space-between"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12
  }, /* @__PURE__ */ React.createElement(DenseSlider, {
    value,
    onChange: handleDrag,
    onChangeCommitted: handleRelease,
    min: 0,
    max,
    step: 1
  })))), /* @__PURE__ */ React.createElement(Divider, null));
}
export default AxisSlider;
