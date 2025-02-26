import MuiAccordion from "@material-ui/core/Accordion";
import { withStyles } from "@material-ui/styles";
import React from "react";

import { LayerStateContext, useSourceData } from "../../hooks";
import { layerFamilyAtom } from "../../state";
import Content from "./Content";
import Header from "./Header";

const Accordion = withStyles({
  root: {
    borderBottom: "1px solid rgba(150, 150, 150, .2)",
    width: 200,
    boxshadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: 0,
      padding: 0,
    },
  },
  expanded: {
    padding: 1,
  },
})(MuiAccordion);

function LayerController() {
  const [sourceInfo] = useSourceData();
  const layerAtom = layerFamilyAtom(sourceInfo);
  const { name = "" } = sourceInfo;
  return (
    <LayerStateContext.Provider value={layerAtom}>
      <Accordion defaultExpanded>
        <Header name={sourceInfo.name ?? ""} />
        <Content />
      </Accordion>
    </LayerStateContext.Provider>
  );
}

export default LayerController;
