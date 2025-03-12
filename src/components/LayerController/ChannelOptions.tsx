import { Cross2Icon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLayerState, useSourceData } from "@/hooks";
import { assert, COLORS, clamp, hexToRGB } from "@/utils";

const RGB_COLORS: [string, string][] = Object.entries(COLORS);

function ChannelOptions(props: { channelIndex: number }) {
  const { channelIndex: i } = props;
  const [info] = useSourceData();
  const [layer, setLayer] = useLayerState();
  const { channel_axis, names } = info;
  assert(channel_axis !== null, "channel_axis is null");

  const handleContrastLimitChange = (unclamped: number, which: "min" | "max") => {
    const value = clamp(unclamped, 0, Number.POSITIVE_INFINITY);
    setLayer(({ layerProps, ...rest }) => {
      const lims = layerProps.contrastLimitsRange[i];
      const vals = layerProps.contrastLimits[i];
      const [min, max] = which === "min" ? [value, lims[1]] : [lims[0], value];
      return {
        ...rest,
        layerProps: {
          ...layerProps,
          contrastLimits: layerProps.contrastLimits.with(i, [
            clamp(vals[0], min, Number.POSITIVE_INFINITY),
            clamp(vals[1], 0, max),
          ]),
          contrastLimitsRange: layerProps.contrastLimitsRange.with(i, [min, max]),
        },
      };
    });
  };

  const handleSelectionChange = (idx: number) => {
    setLayer(({ layerProps, ...rest }) => ({
      ...rest,
      layerProps: {
        ...layerProps,
        selections: layerProps.selections.with(i, layerProps.selections[i].with(channel_axis, idx)),
      },
    }));
  };

  const [min, max] = layer.layerProps.contrastLimitsRange[i];

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
            className="-mr-1 cursor-pointer bg-card hover:bg-card"
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
        <span className="text-xs">channel:</span>
        <Separator />
        <Select
          onValueChange={(i) => handleSelectionChange(+i)}
          value={String(layer.layerProps.selections[i][channel_axis])}
        >
          <SelectTrigger className="w-full focus:ring-0 p-0 h-7 border-none text-xs cursor-pointer select-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="focus:ring-0 border-none">
            {names.map((name, i) => (
              <SelectItem className="text-xs" value={String(i)} key={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator />
        <span className="text-xs">contrast limits:</span>
        <Separator />
        <Input
          type="number"
          className="w-full focus:ring-0 focus-visible:ring-0 focus:border-none p-0 h-7 border-none text-xs cursor-pointer select-none"
          defaultValue={min}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const value = +e.currentTarget.value;
            handleContrastLimitChange(value, "min");
          }}
          onBlur={(e) => handleContrastLimitChange(+e.currentTarget.value, "min")}
        />
        <Input
          type="number"
          className="w-full focus:ring-0 focus-visible:ring-0 focus:border-none p-0 h-7 border-none text-xs cursor-pointer select-none"
          defaultValue={max}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const value = +e.currentTarget.value;
            handleContrastLimitChange(value, "max");
          }}
          onBlur={(e) => handleContrastLimitChange(+e.currentTarget.value, "max")}
        />
        <Separator />
        <span className="text-xs">color:</span>
        <Separator />
        <div className="flex items-center justify-between" aria-label="color-swatch">
          {RGB_COLORS.map(([name, rgb]) => (
            <button
              type="button"
              aria-label={name}
              style={{ backgroundColor: rgb }}
              className="w-3.5 h-3.5 rounded-full cursor-pointer"
              key={name}
              onClick={() => {
                setLayer(({ layerProps, ...rest }) => ({
                  ...rest,
                  layerProps: {
                    ...layerProps,
                    colors: layerProps.colors.with(i, hexToRGB(rgb)),
                  },
                }));
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ChannelOptions;
