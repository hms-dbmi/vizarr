import React from "../../../_snowpack/pkg/react.js";
import {Grid, NativeSelect} from "../../../_snowpack/pkg/@material-ui/core.js";
import {useRecoilValue} from "../../../_snowpack/pkg/recoil.js";
import {sourceInfoState} from "../../state.js";
function AcquisitionController({layerId}) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const {acquisitionId, acquisitions} = sourceInfo[layerId];
  if (!acquisitions) {
    return null;
  }
  const handleSelectionChange = (event) => {
    let value = event.target.value;
    const url = new URL(window.location.href);
    if (value === "-1") {
      url.searchParams.delete("acquisition");
    } else {
      url.searchParams.set("acquisition", value);
    }
    window.location.href = decodeURIComponent(url.href);
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
