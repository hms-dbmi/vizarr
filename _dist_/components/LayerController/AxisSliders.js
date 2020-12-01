import React from "../../../web_modules/react.js";
import {Grid, Divider} from "../../../web_modules/@material-ui/core.js";
import {useRecoilValue} from "../../../web_modules/recoil.js";
import AxisSlider2 from "./AxisSlider.js";
import {sourceInfoState} from "../../state.js";
function AxisSliders({layerId}) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const {axis_labels, channel_axis, loader} = sourceInfo[layerId];
  const sliders = axis_labels.slice(0, -2).map((name, i) => [name, i, loader.base.shape[i]]).filter((d) => {
    if (d[1] === channel_axis)
      return false;
    if (d[2] > 1)
      return true;
    return false;
  }).map(([name, i, size]) => /* @__PURE__ */ React.createElement(AxisSlider2, {
    key: name,
    layerId,
    axisIndex: i,
    max: size - 1
  }));
  if (sliders.length === 0)
    return null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Grid, null, sliders), /* @__PURE__ */ React.createElement(Divider, null));
}
export default AxisSliders;
