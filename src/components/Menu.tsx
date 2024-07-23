import { useAtomValue } from "jotai";
import React, { useReducer } from "react";

import { sourceInfoAtomAtoms } from "../state";
import LayerController from "./LayerController";

import { Button } from "@/components/ui/button";
import { LayerContext } from "@/hooks";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { Card } from "./ui/card";

function Menu({ open = true }: { open?: boolean }) {
  const atoms = useAtomValue(sourceInfoAtomAtoms);
  const [hidden, toggle] = useReducer((v) => !v, !open);
  return (
    <Card className={clsx("relative left-2 top-2 z-20 w-fit border-border rounded-lg", hidden && "rounded-full")}>
      <Button onClick={toggle} variant="ghost" className="m-1 p-0 w-4 h-4 bg-none bg:hover-none cursor-pointer">
        {hidden ? <PlusIcon /> : <MinusIcon />}
      </Button>
      <div className={clsx("max-h-[500px] m-1 bg-card no-scrollbar mb-1", hidden && "hidden")}>
        {atoms.map((sourceAtom) => (
          <LayerContext.Provider value={sourceAtom} key={`${sourceAtom}`}>
            <LayerController />
          </LayerContext.Provider>
        ))}
      </div>
    </Card>
  );
}

export default Menu;
