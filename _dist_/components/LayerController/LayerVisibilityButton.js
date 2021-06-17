import React from "../../../_snowpack/pkg/react.js";
import {useAtom} from "../../../_snowpack/pkg/jotai.js";
import {useAtomValue} from "../../../_snowpack/pkg/jotai/utils.js";
import {IconButton} from "../../../_snowpack/pkg/@material-ui/core.js";
import {Visibility, VisibilityOff} from "../../../_snowpack/pkg/@material-ui/icons.js";
function LayerVisibilityButton({sourceAtom, layerAtom}) {
  const sourceData = useAtomValue(sourceAtom);
  const [layer, setLayer] = useAtom(layerAtom);
  const toggle = (event) => {
    event.stopPropagation();
    setLayer((prev) => {
      const on = !prev.on;
      return {...prev, on};
    });
  };
  return /* @__PURE__ */ React.createElement(IconButton, {
    "aria-label": `toggle-layer-visibility-${sourceData.id}`,
    onClick: toggle,
    style: {
      backgroundColor: "transparent",
      marginTop: "2px",
      color: `rgb(255, 255, 255, ${layer.on ? 1 : 0.5})`
    }
  }, layer.on ? /* @__PURE__ */ React.createElement(Visibility, null) : /* @__PURE__ */ React.createElement(VisibilityOff, null));
}
export default LayerVisibilityButton;
