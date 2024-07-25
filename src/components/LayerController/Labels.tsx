import React from "react";

import { Slider } from "@/components/ui/slider";

import { useLayerState, useSourceData } from "@/hooks";
import { assert } from "@/utils";

export default function Labels({ labelIndex }: { labelIndex: number }) {
  const [source] = useSourceData();
  const [layer, setLayer] = useLayerState();
  assert(source.labels && layer.kind === "multiscale" && layer.labels, "Missing image labels");

  const handleOpacityChange = ([value]: Array<number>) => {
    setLayer((prev) => {
      assert(prev.kind === "multiscale" && prev.labels, "Missing image labels");
      return {
        ...prev,
        labels: prev.labels.with(labelIndex, {
          ...prev.labels[labelIndex],
          layerProps: {
            ...prev.labels[labelIndex].layerProps,
            opacity: value as number,
          },
        }),
      };
    });
  };

  const { name } = source.labels[labelIndex];
  const label = layer.labels[labelIndex];
  return (
    <>
      <div className="flex items-center justify-between">
        <label className="text-xs w-44 text-ellipsis overflow-hidden select-none">{name}</label>
      </div>
      <div className="flex items-center">
        <label className="cursor-pointer">
          {label.on ? (
            <svg viewBox="0 -960 960 960" className="w-5 h-5 fill-gray-200" role="img" aria-label="enabled">
              <path d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          ) : (
            <svg viewBox="0 -960 960 960" className="w-5 h-5 fill-gray-200" role="img" aria-label="disabled">
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          )}
          <input
            type="checkbox"
            onChange={(event) => {
              setLayer((prev) => ({
                ...prev,
                labels: prev.labels?.with(labelIndex, {
                  ...prev.labels[labelIndex],
                  on: event.currentTarget.checked,
                }),
              }));
            }}
            checked={label.on}
            className="hidden"
          />
        </label>
        <Slider
          className="mx-1"
          value={[label.layerProps.opacity]}
          onValueChange={handleOpacityChange}
          min={0}
          max={1}
          step={0.01}
        />
      </div>
    </>
  );
}
