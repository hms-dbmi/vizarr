import React from "../../../web_modules/react.js";
import {useRecoilState} from "../../../web_modules/recoil.js";
import {Slider} from "../../../web_modules/@material-ui/core.js";
import {withStyles} from "../../../web_modules/@material-ui/styles.js";
import {layerStateFamily} from "../../state.js";
const DenseSlider = withStyles({
  root: {
    color: "white",
    padding: "10px 0px 5px 0px",
    marginRight: "5px"
  },
  active: {
    boxshadow: "0px 0px 0px 8px rgba(158, 158, 158, 0.16)"
  }
})(Slider);
function OpacitySlider({layerId}) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const handleChange = (_, value) => {
    const opacity = value;
    setLayer((prev) => ({...prev, layerProps: {...prev.layerProps, opacity}}));
  };
  return /* @__PURE__ */ React.createElement(DenseSlider, {
    value: layer.layerProps.opacity,
    onChange: handleChange,
    min: 0,
    max: 1,
    step: 0.01
  });
}
export default OpacitySlider;
