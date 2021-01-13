import React, {useReducer} from "../../_snowpack/pkg/react.js";
import {useRecoilValue} from "../../_snowpack/pkg/recoil.js";
import {Grid, IconButton} from "../../_snowpack/pkg/@material-ui/core.js";
import {Add, Remove} from "../../_snowpack/pkg/@material-ui/icons.js";
import {makeStyles} from "../../_snowpack/pkg/@material-ui/styles.js";
import {layerIdsState} from "../state.js";
import LayerController from "./LayerController/index.js";
const useStyles = makeStyles({
  root: {
    zIndex: 1,
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "5px",
    left: "5px",
    top: "5px"
  },
  scroll: {
    maxHeight: 500,
    overflowX: "hidden",
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      display: "none",
      background: "transparent"
    },
    scrollbarWidth: "none",
    flexDirection: "column"
  }
});
function Menu() {
  const layerIds = useRecoilValue(layerIdsState);
  const [hidden, toggle] = useReducer((v) => !v, false);
  const classes = useStyles();
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root,
    style: {padding: `0px 5px ${hidden ? 0 : 5}px 5px`}
  }, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "column",
    alignItems: "flex-start"
  }, /* @__PURE__ */ React.createElement(IconButton, {
    style: {
      backgroundColor: "transparent",
      padding: 0
    },
    onClick: toggle
  }, hidden ? /* @__PURE__ */ React.createElement(Add, null) : /* @__PURE__ */ React.createElement(Remove, null)), /* @__PURE__ */ React.createElement("div", {
    className: classes.scroll,
    style: {display: hidden ? "none" : "flex"}
  }, layerIds.map((id) => /* @__PURE__ */ React.createElement(LayerController, {
    layerId: id,
    key: id
  })))));
}
export default Menu;
