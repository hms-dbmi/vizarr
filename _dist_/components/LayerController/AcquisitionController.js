import React from "../../../web_modules/react.js";
import {Grid, NativeSelect} from "../../../web_modules/@material-ui/core.js";
import {useRecoilValue} from "../../../web_modules/recoil.js";
import {sourceInfoState} from "../../state.js";
function AcquisitionController({layerId}) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const {acquisitionId, acquisitions, source} = sourceInfo[layerId];
  if (!acquisitions) {
    return null;
  }
  const handleSelectionChange = (event) => {
    let value = event.target.value;
    let acquisition = value === "-1" ? "" : `&acquisition=${value}`;
    window.location.href = window.location.origin + window.location.pathname + `?source=${source}${acquisition}`;
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Grid, null, /* @__PURE__ */ React.createElement(NativeSelect, {
    fullWidth: true,
    style: {fontSize: "0.7em"},
    onChange: handleSelectionChange,
    value: acquisitionId
  }, /* @__PURE__ */ React.createElement("option", {
    value: "-1",
    key: "-1"
  }, "Filter by Acquisition"), acquisitions.map((acq) => {
    acq = acq;
    return /* @__PURE__ */ React.createElement("option", {
      value: acq.id,
      key: acq.id
    }, "Acquisition: ", acq.name);
  }))));
}
export default AcquisitionController;
