import React from "../../../_snowpack/pkg/react.js";
import {useAtomValue} from "../../../_snowpack/pkg/jotai/utils.js";
import {AccordionDetails, Grid, Typography, Divider} from "../../../_snowpack/pkg/@material-ui/core.js";
import {withStyles} from "../../../_snowpack/pkg/@material-ui/styles.js";
import AcquisitionController from "./AcquisitionController.js";
import AddChannelButton from "./AddChannelButton.js";
import OpacitySlider from "./OpacitySlider.js";
import AxisSliders from "./AxisSliders.js";
import ChannelController from "./ChannelController.js";
import {range} from "../../utils.js";
const Details = withStyles({
  root: {
    padding: "2px 5px",
    borderLeft: "1px solid rgba(150, 150, 150, .2)",
    borderRight: "1px solid rgba(150, 150, 150, .2)"
  }
})(AccordionDetails);
function Content({sourceAtom, layerAtom}) {
  const layer = useAtomValue(layerAtom);
  const nChannels = layer.layerProps.loaderSelection.length;
  return /* @__PURE__ */ React.createElement(Details, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "column"
  }, /* @__PURE__ */ React.createElement(AcquisitionController, {
    sourceAtom,
    layerAtom
  }), /* @__PURE__ */ React.createElement(Grid, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justify: "space-between"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 3
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption"
  }, "opacity:")), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 8
  }, /* @__PURE__ */ React.createElement(OpacitySlider, {
    sourceAtom,
    layerAtom
  })))), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(AxisSliders, {
    sourceAtom,
    layerAtom
  }), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justify: "space-between"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 3
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption"
  }, "channels:")), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 1
  }, /* @__PURE__ */ React.createElement(AddChannelButton, {
    sourceAtom,
    layerAtom
  }))), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(Grid, null, range(nChannels).map((i) => /* @__PURE__ */ React.createElement(ChannelController, {
    sourceAtom,
    layerAtom,
    channelIndex: i,
    key: i
  })))));
}
export default Content;
