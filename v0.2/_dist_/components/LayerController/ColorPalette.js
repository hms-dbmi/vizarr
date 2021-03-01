import React from "../../../_snowpack/pkg/react.js";
import {IconButton} from "../../../_snowpack/pkg/@material-ui/core.js";
import {Lens} from "../../../_snowpack/pkg/@material-ui/icons.js";
import {makeStyles} from "../../../_snowpack/pkg/@material-ui/styles.js";
import {COLORS, hexToRGB} from "../../utils.js";
const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2px"
  },
  button: {
    padding: "3px",
    width: "16px",
    height: "16px"
  }
}));
const RGB_COLORS = Object.entries(COLORS).map(([name, hex]) => [name, hexToRGB(hex)]);
function ColorPalette({handleChange}) {
  const classes = useStyles();
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.container,
    "aria-label": "color-swatch"
  }, RGB_COLORS.map(([name, rgb]) => {
    return /* @__PURE__ */ React.createElement(IconButton, {
      className: classes.button,
      key: name,
      onClick: () => handleChange(rgb)
    }, /* @__PURE__ */ React.createElement(Lens, {
      fontSize: "small",
      style: {color: `rgb(${rgb})`}
    }));
  }));
}
export default ColorPalette;
