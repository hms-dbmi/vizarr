import { Add, Remove } from "@material-ui/icons";
import { useAtomValue } from "jotai";
import React, { useReducer } from "react";

import { sourceInfoAtomAtoms } from "../state";
import LayerController from "./LayerController";

import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { LayerContext } from "@/hooks";
import clsx from "clsx";

function Menu(props: { open?: boolean }) {
  const sourceAtoms = useAtomValue(sourceInfoAtomAtoms);
  const [hidden, toggle] = useReducer((v) => !v, !(props.open ?? true));
  return (
    <Card className="relative left-2 top-2 z-20 w-fit border-border rounded-lg bg-card/85">
      <Button onClick={toggle} variant="ghost" className="m-1 p-0 w-4 h-4 hover:bg-transparent cursor-pointer">
        {hidden ? <Add /> : <Remove />}
      </Button>
      <div className={clsx("max-h-[500px] p-1 pt-0 no-scrollbar -mt-2 mb-0.5", hidden && "hidden")}>
        {sourceAtoms.map((sourceAtom) => (
          <LayerContext.Provider value={sourceAtom} key={`${sourceAtom}`}>
            <LayerController />
          </LayerContext.Provider>
        ))}
      </div>
    </Card>
  );
}

export default Menu;
