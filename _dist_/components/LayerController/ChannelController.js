import React from "../../../web_modules/react.js";
import {useRecoilState, useRecoilValue} from "../../../web_modules/recoil.js";
import {Slider, Typography, Grid, IconButton} from "../../../web_modules/@material-ui/core.js";
import {RadioButtonChecked, RadioButtonUnchecked} from "../../../web_modules/@material-ui/icons.js";
import ChannelOptions2 from "./ChannelOptions.js";
import {layerStateFamily, sourceInfoState} from "../../state.js";
function ChannelController({layerId, channelIndex}) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const handleContrastChange = (_, v) => {
    setLayer((prev) => {
      const sliderValues2 = [...prev.layerProps.sliderValues];
      sliderValues2[channelIndex] = v;
      return {...prev, layerProps: {...prev.layerProps, sliderValues: sliderValues2}};
    });
  };
  const handleVisibilityChange = () => {
    setLayer((prev) => {
      const channelIsOn2 = [...prev.layerProps.channelIsOn];
      channelIsOn2[channelIndex] = !channelIsOn2[channelIndex];
      return {...prev, layerProps: {...prev.layerProps, channelIsOn: channelIsOn2}};
    });
  };
  const {sliderValues, colorValues, contrastLimits, channelIsOn, colormap, loaderSelection} = layer.layerProps;
  const value = [...sliderValues[channelIndex]];
  const color = `rgb(${colormap ? [255, 255, 255] : colorValues[channelIndex]})`;
  const on = channelIsOn[channelIndex];
  const [min, max] = contrastLimits[channelIndex];
  const {channel_axis, names} = sourceInfo[layerId];
  const selection = loaderSelection[channelIndex];
  const nameIndex = Number.isInteger(channel_axis) ? selection[channel_axis] : 0;
  const label = names[nameIndex];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justify: "space-between",
    wrap: "nowrap"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 10
  }, /* @__PURE__ */ React.createElement("div", {
    style: {width: 165, overflow: "hidden", textOverflow: "ellipsis"}
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption",
    noWrap: true
  }, label))), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 1
  }, /* @__PURE__ */ React.createElement(ChannelOptions2, {
    layerId,
    channelIndex
  }))), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justify: "space-between"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 2
  }, /* @__PURE__ */ React.createElement(IconButton, {
    style: {
      color,
      backgroundColor: "transparent",
      padding: 0,
      zIndex: 2
    },
    onClick: handleVisibilityChange
  }, on ? /* @__PURE__ */ React.createElement(RadioButtonChecked, null) : /* @__PURE__ */ React.createElement(RadioButtonUnchecked, null))), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 10
  }, /* @__PURE__ */ React.createElement(Slider, {
    value,
    onChange: handleContrastChange,
    min,
    max,
    step: 0.01,
    style: {
      padding: "10px 0px 5px 0px",
      color
    }
  }))));
}
export default ChannelController;
