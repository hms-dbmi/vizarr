import React, {useState} from "../../../_snowpack/pkg/react.js";
import {useAtom} from "../../../_snowpack/pkg/jotai.js";
import {useAtomValue} from "../../../_snowpack/pkg/jotai/utils.js";
import {IconButton, Popover, Paper, Typography, Divider, Input} from "../../../_snowpack/pkg/@material-ui/core.js";
import {withStyles} from "../../../_snowpack/pkg/@material-ui/styles.js";
import {MoreHoriz} from "../../../_snowpack/pkg/@material-ui/icons.js";
const DenseInput = withStyles({
  root: {
    width: "5.5em",
    fontSize: "0.7em"
  }
})(Input);
function AxisOptions({sourceAtom, layerAtom, axisIndex, max}) {
  const sourceData = useAtomValue(sourceAtom);
  const [layer, setLayer] = useAtom(layerAtom);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleIndexChange = (event) => {
    let value2 = +event.target.value;
    if (value2 < 0)
      value2 = 0;
    if (value2 > max)
      value2 = max;
    setLayer((prev) => {
      let layerProps = {...prev.layerProps};
      layerProps.loaderSelection = layerProps.loaderSelection.map((ch) => {
        let new_ch = [...ch];
        new_ch[axisIndex] = value2;
        return new_ch;
      });
      return {...prev, layerProps};
    });
  };
  const open = Boolean(anchorEl);
  const id = open ? `${axisIndex}-index-${sourceData.id}-options` : void 0;
  const value = layer.layerProps.loaderSelection[0] ? layer.layerProps.loaderSelection[0][axisIndex] : 1;
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
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption"
  }, "Index:"), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(DenseInput, {
    value,
    onChange: handleIndexChange,
    type: "number",
    id: "max",
    fullWidth: false
  }), /* @__PURE__ */ React.createElement(Divider, null))));
}
export default AxisOptions;
