import React, {useEffect} from "../../../web_modules/react.js";
import {useRecoilValue, useRecoilState} from "../../../web_modules/recoil.js";
import MuiAccordion from "../../../web_modules/@material-ui/core/Accordion.js";
import {withStyles} from "../../../web_modules/@material-ui/styles.js";
import {sourceInfoState, layerStateFamily} from "../../state.js";
import Header2 from "./Header.js";
import Content2 from "./Content.js";
const Accordion2 = withStyles({
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
    if (layerId in sourceInfo && !layer.layerProps.loader) {
      const config = sourceInfo[layerId];
      initLayer(config);
    }
  }, [sourceInfo]);
  const {name = ""} = sourceInfo[layerId];
  const nChannels = layer.layerProps.loaderSelection.length;
  return /* @__PURE__ */ React.createElement(Accordion2, {
    defaultExpanded: true
  }, /* @__PURE__ */ React.createElement(Header2, {
    layerId,
    name
  }), /* @__PURE__ */ React.createElement(Content2, {
    layerId,
    nChannels
  }));
}
export default LayerController;
