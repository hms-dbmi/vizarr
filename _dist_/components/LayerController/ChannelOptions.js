import React, {useState} from "../../../web_modules/react.js";
import {useRecoilState, useRecoilValue} from "../../../web_modules/recoil.js";
import {IconButton, Popover, Paper, Typography, Divider, Input, NativeSelect} from "../../../web_modules/@material-ui/core.js";
import {withStyles} from "../../../web_modules/@material-ui/styles.js";
import {MoreHoriz, Remove} from "../../../web_modules/@material-ui/icons.js";
import {layerStateFamily, sourceInfoState} from "../../state.js";
import ColorPalette2 from "./ColorPalette.js";
const DenseInput = withStyles({
  root: {
    width: "5.5em",
    fontSize: "0.7em"
  }
})(Input);
function ChannelOptions({layerId, channelIndex}) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const [anchorEl, setAnchorEl] = useState(null);
  const {channel_axis, names} = sourceInfo[layerId];
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleColorChange = (rgb) => {
    setLayer((prev) => {
      const colorValues = [...prev.layerProps.colorValues];
      colorValues[channelIndex] = rgb;
      return {...prev, layerProps: {...prev.layerProps, colorValues}};
    });
  };
  const handleContrastLimitChange = (event) => {
    const targetId = event.target.id;
    let value = +event.target.value;
    if (value < 0)
      value = 0;
    setLayer((prev) => {
      const contrastLimits = [...prev.layerProps.contrastLimits];
      const sliderValues = [...prev.layerProps.sliderValues];
      const [cmin, cmax] = contrastLimits[channelIndex];
      const [smin, smax] = sliderValues[channelIndex];
      const [umin, umax] = targetId === "min" ? [value, cmax] : [cmin, value];
      if (umin > smin)
        sliderValues[channelIndex] = [umin, smax];
      if (umax < smax)
        sliderValues[channelIndex] = [smin, umax];
      contrastLimits[channelIndex] = [umin, umax];
      return {
        ...prev,
        layerProps: {...prev.layerProps, sliderValues, contrastLimits}
      };
    });
  };
  const handleRemove = () => {
    setLayer((prev) => {
      const {layerProps} = prev;
      const colorValues = [...layerProps.colorValues];
      const sliderValues = [...layerProps.sliderValues];
      const contrastLimits = [...layerProps.contrastLimits];
      const loaderSelection = [...layerProps.loaderSelection];
      const channelIsOn = [...layerProps.channelIsOn];
      colorValues.splice(channelIndex, 1);
      sliderValues.splice(channelIndex, 1);
      contrastLimits.splice(channelIndex, 1);
      loaderSelection.splice(channelIndex, 1);
      channelIsOn.splice(channelIndex, 1);
      return {
        ...prev,
        layerProps: {
          ...layerProps,
          colorValues,
          sliderValues,
          loaderSelection,
          channelIsOn,
          contrastLimits
        }
      };
    });
  };
  const handleSelectionChange = (event) => {
    setLayer((prev) => {
      const loaderSelection = [...prev.layerProps.loaderSelection];
      const channelSelection = [...loaderSelection[channelIndex]];
      if (Number.isInteger(channel_axis)) {
        channelSelection[channel_axis] = +event.target.value;
        loaderSelection[channelIndex] = channelSelection;
      }
      return {...prev, layerProps: {...prev.layerProps, loaderSelection}};
    });
  };
  const open = Boolean(anchorEl);
  const id = open ? `channel-${channelIndex}-${layerId}-options` : void 0;
  const [min, max] = layer.layerProps.contrastLimits[channelIndex];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(IconButton, {
    onClick: handleClick,
    "aria-describedby": id,
    style: {
      backgroundColor: "transparent",
      padding: 0,
      zIndex: 2,
      cursor: "pointer"
    }
  }, /* @__PURE__ */ React.createElement(MoreHoriz, null)), /* @__PURE__ */ React.createElement(Popover, {
    id,
    open,
    anchorEl,
    onClose: handleClose,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left"
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left"
    }
  }, /* @__PURE__ */ React.createElement(Paper, {
    style: {padding: "0px 4px", marginBottom: 4}
  }, /* @__PURE__ */ React.createElement("div", {
    style: {display: "flex", justifyContent: "space-between"}
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption"
  }, "remove:"), /* @__PURE__ */ React.createElement(IconButton, {
    onClick: handleRemove
  }, /* @__PURE__ */ React.createElement(Remove, null))), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption"
  }, "selection:"), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(NativeSelect, {
    fullWidth: true,
    style: {fontSize: "0.7em"},
    id: `layer-${layerId}-channel-select`,
    onChange: handleSelectionChange,
    value: layer.layerProps.loaderSelection[channelIndex][channel_axis]
  }, names.map((name, i) => /* @__PURE__ */ React.createElement("option", {
    value: i,
    key: name
  }, "(", i, ") ", name))), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption"
  }, "contrast limits:"), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(DenseInput, {
    value: min,
    onChange: handleContrastLimitChange,
    type: "number",
    id: "min",
    fullWidth: false
  }), /* @__PURE__ */ React.createElement(DenseInput, {
    value: max,
    onChange: handleContrastLimitChange,
    type: "number",
    id: "max",
    fullWidth: false
  }), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption"
  }, "color:"), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement("div", {
    style: {display: "flex", justifyContent: "center"}
  }, /* @__PURE__ */ React.createElement(ColorPalette2, {
    handleChange: handleColorChange
  })))));
}
export default ChannelOptions;
