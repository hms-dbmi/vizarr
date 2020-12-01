import React from "../../../web_modules/react.js";
import {AccordionDetails, Grid, Typography, Divider} from "../../../web_modules/@material-ui/core.js";
import {withStyles} from "../../../web_modules/@material-ui/styles.js";
import AcquisitionController2 from "./AcquisitionController.js";
import AddChannelButton2 from "./AddChannelButton.js";
import OpacitySlider2 from "./OpacitySlider.js";
import AxisSliders2 from "./AxisSliders.js";
import ChannelController2 from "./ChannelController.js";
import {range} from "../../utils.js";
const Details = withStyles({
  root: {
    padding: "2px 5px",
    borderLeft: "1px solid rgba(150, 150, 150, .2)",
    borderRight: "1px solid rgba(150, 150, 150, .2)"
  }
})(AccordionDetails);
function Content({layerId, nChannels}) {
  return /* @__PURE__ */ React.createElement(Details, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "column"
  }, /* @__PURE__ */ React.createElement(AcquisitionController2, {
    layerId
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
  }, /* @__PURE__ */ React.createElement(OpacitySlider2, {
    layerId
  })))), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(AxisSliders2, {
    layerId
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
  }, /* @__PURE__ */ React.createElement(AddChannelButton2, {
    layerId
  }))), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(Grid, null, range(nChannels).map((i) => /* @__PURE__ */ React.createElement(ChannelController2, {
    layerId,
    channelIndex: i,
    key: i + layerId
  })))));
}
export default Content;
