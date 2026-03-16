import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLayerState, useSourceData } from "@/hooks";
import { MAX_CHANNELS, calcDataRange, hexToRGB, resolveLoaderFromLayerProps } from "@/utils";

function AddChannelButton() {
  const [source, setSource] = useSourceData();
  const [layer, setLayer] = useLayerState();

  const handleChange = async (channelIndex: number) => {
    const channelSelection = source.channel_axis
      ? source.defaults.selection.with(source.channel_axis, channelIndex)
      : [...source.defaults.selection];

    // cacluate contrast limits if missing from source;
    let lim: [min: number, max: number];
    if (source.contrast_limits[channelIndex]) {
      lim = source.contrast_limits[channelIndex];
    } else {
      const loader = resolveLoaderFromLayerProps(layer.layerProps);
      const lowres = Array.isArray(loader) ? loader[loader.length - 1] : loader;
      lim = await calcDataRange(lowres, channelSelection);
      // Update source data with newly calculated limit
      setSource((prev) => {
        const clims = [...prev.contrast_limits];
        clims[channelIndex] = lim;
        return { ...prev, contrast_limits: clims };
      });
    }
    setLayer(({ layerProps, ...rest }) => {
      const selections = [...layerProps.selections, channelSelection];
      const colors = [...layerProps.colors, hexToRGB(source.colors[channelIndex])];
      const contrastLimits = [...layerProps.contrastLimitsRange, lim];
      const channelsVisible = [...layerProps.channelsVisible, true];
      return {
        ...rest,
        layerProps: {
          ...layerProps,
          selections,
          colors,
          contrastLimits,
          contrastLimitsRange: [...contrastLimits],
          channelsVisible,
        },
      };
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer bg-card hover:bg-card"
          disabled={layer.layerProps.selections.length === MAX_CHANNELS}
        >
          <PlusIcon className="fill-accent" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-1 pt-0 pb-1 w-32 border-border rounded-lg" side="bottom" alignOffset={20}>
        <span className="text-xs">selection:</span>
        <Separator />
        <Select onValueChange={(i) => handleChange(+i)} value={undefined}>
          <SelectTrigger className="w-full focus:ring-0 p-0 h-7 border-none text-xs cursor-pointer select-none">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent className="focus:ring-0 border-none">
            {source.names.map((name, i) => (
              <SelectItem className="text-xs" value={String(i)} key={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
}

export default AddChannelButton;
