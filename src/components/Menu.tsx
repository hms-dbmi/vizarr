import { useAtomValue } from "jotai";
import React, { useReducer } from "react";

import { SourceDataContext } from "../hooks";
import { sourceInfoAtomAtoms } from "../state";
import LayerController from "./LayerController";

import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";

function Menu({ open = true }: { open?: boolean }) {
  const atoms = useAtomValue(sourceInfoAtomAtoms);
  const [hidden, toggle] = useReducer((v) => !v, !open);
  return (
    <div
      className={cn(
        "relative left-2 top-2 z-20 w-fit h-fit bg-card text-card-foreground rounded-lg",
        hidden && "rounded-full p-0 m-0 w-5 h-5 flex items-center justify-center",
      )}
    >
      <button type="button" onClick={toggle} className={cn("bg-card hover:bg-card cursor-pointer", !hidden && "ml-1")}>
        {hidden ? <PlusIcon /> : <MinusIcon />}
      </button>
      <div className={cn("max-h-[500px] m-1 bg-card no-scrollbar pb-1")} hidden={hidden}>
        {atoms.map((sourceAtom) => (
          <SourceDataContext.Provider value={sourceAtom} key={`${sourceAtom}`}>
            <LayerController />
          </SourceDataContext.Provider>
        ))}
      </div>
    </div>
  );
}

export default Menu;
