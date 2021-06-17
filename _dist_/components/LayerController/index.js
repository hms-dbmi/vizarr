import React from "../../../_snowpack/pkg/react.js";
import {useAtomValue} from "../../../_snowpack/pkg/jotai/utils.js";
import MuiAccordion from "../../../_snowpack/pkg/@material-ui/core/Accordion.js";
import {withStyles} from "../../../_snowpack/pkg/@material-ui/styles.js";
import Header from "./Header.js";
import Content from "./Content.js";
import {layerFamilyAtom} from "../../state.js";
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
function LayerController({sourceAtom}) {
  const sourceInfo = useAtomValue(sourceAtom);
  const layerAtom = layerFamilyAtom(sourceInfo);
  const {name = ""} = sourceInfo;
  return /* @__PURE__ */ React.createElement(Accordion, {
    defaultExpanded: true
  }, /* @__PURE__ */ React.createElement(Header, {
    sourceAtom,
    layerAtom,
    name
  }), /* @__PURE__ */ React.createElement(Content, {
    sourceAtom,
    layerAtom
  }));
}
export default LayerController;
