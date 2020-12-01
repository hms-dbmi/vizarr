import React from "../../../web_modules/react.js";
import {useRecoilState} from "../../../web_modules/recoil.js";
import {IconButton} from "../../../web_modules/@material-ui/core.js";
import {Visibility, VisibilityOff} from "../../../web_modules/@material-ui/icons.js";
import {layerStateFamily} from "../../state.js";
function LayerVisibilityButton({layerId}) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const toggle = (event) => {
    event.stopPropagation();
    setLayer((prev) => {
      const on2 = !prev.on;
      return {...prev, on: on2};
    });
  };
  const {on} = layer;
  return /* @__PURE__ */ React.createElement(IconButton, {
    "aria-label": `toggle-layer-visibility-${layerId}`,
    onClick: toggle,
    style: {
      backgroundColor: "transparent",
      marginTop: "2px",
      color: `rgb(255, 255, 255, ${on ? 1 : 0.5})`
    }
  }, on ? /* @__PURE__ */ React.createElement(Visibility, null) : /* @__PURE__ */ React.createElement(VisibilityOff, null));
}
export default LayerVisibilityButton;
