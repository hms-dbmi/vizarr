import MuiAccordion from "@material-ui/core/Accordion";
import { withStyles } from "@material-ui/styles";
import { useAtomValue } from "jotai";
import React from "react";

import type { ControllerProps } from "../../state";
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

function LayerController({ sourceAtom }: Omit<ControllerProps, "layerAtom">) {
  const sourceInfo = useAtomValue(sourceAtom);
  const layerAtom = layerFamilyAtom(sourceInfo);
  const { name = "" } = sourceInfo;
  return (
    <Accordion defaultExpanded>
      <Header sourceAtom={sourceAtom} layerAtom={layerAtom} name={name} />
      <Content sourceAtom={sourceAtom} layerAtom={layerAtom} />
    </Accordion>
  );
}

export default LayerController;
