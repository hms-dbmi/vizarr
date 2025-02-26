import { IconButton } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import React from "react";
import type { MouseEvent } from "react";
import { useLayerState, useSourceData } from "../../hooks";

function LayerVisibilityButton() {
  const [sourceData] = useSourceData();
  const [layer, setLayer] = useLayerState();
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLayer((prev) => {
      const on = !prev.on;
      return { ...prev, on };
    });
  };
  return (
    <IconButton
      aria-label={`toggle-layer-visibility-${sourceData.id}`}
      onClick={toggle}
      style={{
        backgroundColor: "transparent",
        marginTop: "2px",
        color: `rgb(255, 255, 255, ${layer.on ? 1 : 0.5})`,
      }}
    >
      {layer.on ? <Visibility /> : <VisibilityOff />}
    </IconButton>
  );
}

export default LayerVisibilityButton;
