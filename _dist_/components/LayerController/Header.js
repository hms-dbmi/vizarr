import React from "../../../web_modules/react.js";
import {AccordionSummary, Typography} from "../../../web_modules/@material-ui/core.js";
import {withStyles} from "../../../web_modules/@material-ui/styles.js";
import LayerVisibilityButton2 from "./LayerVisibilityButton.js";
const DenseAccordionSummary = withStyles({
  root: {
    borderBottom: "1px solid rgba(150, 150, 150, .125)",
    backgroundColor: "rgba(150, 150, 150, 0.25)",
    display: "block",
    padding: "0 3px",
    height: 27,
    minHeight: 27,
    overflow: "hidden",
    transition: "none",
    "&$expanded": {
      minHeight: 27
    }
  },
  content: {
    margin: 0,
    "&$expanded": {
      margin: 0
    }
  },
  expanded: {}
})(AccordionSummary);
function Header({layerId, name}) {
  const label = `layer-controller-${layerId}`;
  return /* @__PURE__ */ React.createElement(DenseAccordionSummary, {
    "aria-controls": label,
    id: label
  }, /* @__PURE__ */ React.createElement("div", {
    style: {display: "flex", flexDirection: "row"}
  }, /* @__PURE__ */ React.createElement(LayerVisibilityButton2, {
    layerId
  }), /* @__PURE__ */ React.createElement(Typography, {
    style: {
      marginTop: "4px",
      marginLeft: "5px"
    },
    variant: "body2"
  }, name)));
}
export default Header;
