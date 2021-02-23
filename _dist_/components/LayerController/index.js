import React, {useEffect} from "../../../_snowpack/pkg/react.js";
import {useRecoilValue, useRecoilState} from "../../../_snowpack/pkg/recoil.js";
import MuiAccordion from "../../../_snowpack/pkg/@material-ui/core/Accordion.js";
import {withStyles} from "../../../_snowpack/pkg/@material-ui/styles.js";
import {sourceInfoState, layerStateFamily} from "../../state.js";
import Header from "./Header.js";
import Content from "./Content.js";
const Accordion = withStyles({
  root: {
    borderBottom: "1px solid rgba(150, 150, 150, .2)",
    width: 200,
    boxshadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0
    },
    "&:before": {
      display: "none"
    },
    "&$expanded": {
      margin: 0,
      padding: 0
    }
  },
  expanded: {
    padding: 1
  }
})(MuiAccordion);
function LayerController({layerId}) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  useEffect(() => {
    async function initLayer(sourceData) {
      const {initLayerStateFromSource} = await import("../../io.js");
      const initialLayerState = await initLayerStateFromSource(sourceData, layerId);
      setLayer(initialLayerState);
    }
    if (layerId in sourceInfo) {
      const config = sourceInfo[layerId];
      initLayer(config);
    }
  }, [sourceInfo]);
  const {name = ""} = sourceInfo[layerId];
  const nChannels = layer.layerProps.loaderSelection.length;
  return /* @__PURE__ */ React.createElement(Accordion, {
    defaultExpanded: true
  }, /* @__PURE__ */ React.createElement(Header, {
    layerId,
    name
  }), /* @__PURE__ */ React.createElement(Content, {
    layerId,
    nChannels
  }));
}
export default LayerController;
