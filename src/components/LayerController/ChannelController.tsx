import * as React from "react";

import { Slider } from "@/components/ui/slider";
import { useLayer, useSourceValue } from "@/hooks";
import ChannelOptions from "./ChannelOptions";

function ChannelController(props: { channelIndex: number }) {
  const { channelIndex: i } = props;
  const sourceData = useSourceValue();
  const [layer, setLayer] = useLayer();

  const value = layer.layerProps.contrastLimits[i];
  const color = `rgb(${layer.layerProps.colormap ? [255, 255, 255] : layer.layerProps.colors[i]})`;
  const on = layer.layerProps.channelsVisible[i];
  const [min, max] = layer.layerProps.contrastLimitsRange[i];

  const { channel_axis, names } = sourceData;
  const selection = layer.layerProps.selections[i];
  const nameIndex = Number.isInteger(channel_axis) && channel_axis !== null ? selection[channel_axis] : 0;
  const label = names[nameIndex];

  return (
    <>
      <div className="flex items-center justify-between">
        <label className="text-xs w-44 text-ellipsis overflow-hidden select-none">{label}</label>
        <ChannelOptions channelIndex={i} />
      </div>
      <div className="flex items-center">
        <label className="cursor-pointer">
          {on ? (
            <svg viewBox="0 -960 960 960" className="w-5 h-5" fill={color} role="img" aria-label="enabled">
              <path d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          ) : (
            <svg viewBox="0 -960 960 960" className="w-5 h-5" fill={color} role="img" aria-label="disabled">
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          )}
          <input
            type="checkbox"
            onChange={(event) => {
              setLayer((prev) => ({
                ...prev,
                layerProps: {
                  ...prev.layerProps,
                  channelsVisible: prev.layerProps.channelsVisible.with(i, event.currentTarget.checked),
                },
              }));
            }}
            checked={on}
            className="hidden"
          />
        </label>
        <Slider
          className="mx-1"
          value={[...value]}
          onValueChange={(update: [number, number]) => {
            setLayer((prev) => ({
              ...prev,
              layerProps: {
                ...prev.layerProps,
                contrastLimits: prev.layerProps.contrastLimits.with(i, [...update]),
              },
            }));
          }}
          color={color}
          min={min}
          max={max}
          step={0.01}
        />
      </div>
    </>
  );
}

export default ChannelController;
