import { Cross2Icon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLayer, useSourceValue } from "@/hooks";
import { clamp } from "@/utils";
import ColorPalette from "./ColorPalette";

function ChannelOptions(props: { channelIndex: number }) {
  const { channelIndex: i } = props;
  const info = useSourceValue();
  const [layer, setLayer] = useLayer();
  const { channel_axis, names } = info;

  const handleContrastLimitChange = (unclamped: number, which: "min" | "max") => {
    const value = clamp(unclamped, { min: 0 });

    setLayer((prev) => {
      const contrastLimitsRange = [...prev.layerProps.contrastLimitsRange];
      const contrastLimits = [...prev.layerProps.contrastLimits];

      const [cmin, cmax] = contrastLimitsRange[i];
      const [smin, smax] = contrastLimits[i];

      const [umin, umax] = which === "min" ? [value, cmax] : [cmin, value];

      // Update sliders if needed
      if (umin > smin) contrastLimits[i] = [umin, smax];
      if (umax < smax) contrastLimits[i] = [smin, umax];

      contrastLimitsRange[i] = [umin, umax];
      return {
        ...prev,
        layerProps: { ...prev.layerProps, contrastLimits, contrastLimitsRange },
      };
    });
  };

  const handleSelectionChange = (idx: number) => {
    setLayer((prev) => {
      const selections = [...prev.layerProps.selections];
      const channelSelection = [...selections[i]];
      if (Number.isInteger(channel_axis)) {
        channelSelection[channel_axis as number] = idx;
        selections[i] = channelSelection;
      }
      return { ...prev, layerProps: { ...prev.layerProps, selections } };
    });
  };

  const [vmin, vmax] = layer.layerProps.contrastLimits[i];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="cursor-pointer bg-card hover:bg-card">
          <DotsHorizontalIcon className="fill-accent" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-1 pt-0 pb-1 w-32 border-border rounded-lg" side="bottom" alignOffset={20}>
        <div className="flex items-center justify-between">
          <span className="text-xs">remove:</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer bg-card hover:bg-card"
            onMouseDown={() => {
              setLayer(({ layerProps, ...rest }) => {
                return {
                  ...rest,
                  layerProps: {
                    ...layerProps,
                    colors: layerProps.colors.toSpliced(i, 1),
                    selections: layerProps.selections.toSpliced(i, 1),
                    channelsVisible: layerProps.channelsVisible.toSpliced(i, 1),
                    contrastLimits: layerProps.contrastLimits.toSpliced(i, 1),
                    contrastLimitsRange: layerProps.contrastLimitsRange.toSpliced(i, 1),
                  },
                };
              });
            }}
          >
            <Cross2Icon />
          </Button>
        </div>
        <Separator />
        <span className="text-xs">selection:</span>
        <Separator />
        <Select onValueChange={(i) => handleSelectionChange(+i)} value={undefined}>
          <SelectTrigger className="w-full focus:ring-0 p-0 h-7 border-none text-xs cursor-pointer select-none">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent className="focus:ring-0 border-none">
            {names.map((name, i) => (
              <SelectItem value={String(i)} key={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator />
        <span className="text-xs">contrast limits:</span>
        <Separator />
        <Input
          className="w-full focus:ring-0 focus-visible:ring-0 focus:border-none p-0 h-7 border-none text-xs cursor-pointer select-none"
          value={vmin}
          onChange={(e) => handleContrastLimitChange(+e.target.value, "min")}
          type="number"
        />
        <Input
          className="w-full focus:ring-0 focus-visible:ring-0 focus:border-none p-0 h-7 border-none text-xs cursor-pointer select-none"
          value={vmax}
          onChange={(e) => handleContrastLimitChange(+e.target.value, "max")}
          type="number"
        />
        <Separator />
        <span className="text-xs">color:</span>
        <Separator />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ColorPalette
            handleChange={(rgb) => {
              setLayer(({ layerProps, ...rest }) => ({
                ...rest,
                layerProps: {
                  ...layerProps,
                  colors: layerProps.colors.with(i, rgb),
                },
              }));
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ChannelOptions;
