import { useAtomValue } from "jotai";
import React, { useReducer } from "react";

import { sourceInfoAtomAtoms } from "../state";
import LayerController from "./LayerController";

import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { LayerContext } from "@/hooks";
import clsx from "clsx";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";

function Menu(props: { open?: boolean }) {
  const sourceAtoms = useAtomValue(sourceInfoAtomAtoms);
  const [hidden, toggle] = useReducer((v) => !v, !(props.open ?? true));
  return (
    <Card
      className={clsx("relative left-2 top-2 z-20 w-fit border-border rounded-lg bg-card/85", hidden && "rounded-full")}
    >
      <Button onClick={toggle} variant="ghost" className="m-1 rounded-full p-0 w-4 h-4 bg-none cursor-pointer">
        {hidden ? <PlusIcon /> : <MinusIcon />}
      </Button>
      <div className={clsx("max-h-[500px] p-1 pt-0 bg-card no-scrollbar mb-0.5", hidden && "hidden")}>
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
