import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useLayer } from "@/hooks";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

function AxisOptions(props: { axisIndex: number; max: number }) {
  const { axisIndex, max } = props;
  const [layer, setLayer] = useLayer();
  const value = layer.layerProps.selections[0] ? layer.layerProps.selections[0][axisIndex] : 1;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="cursor-pointer bg-card hover:bg-card">
          <DotsHorizontalIcon className="fill-accent" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-1 pt-0 pb-1 w-32 border-border rounded-lg" side="bottom" alignOffset={20}>
        <span className="text-xs">index:</span>
        <Separator />
        <Input
          className="w-full focus:ring-0 focus-visible:ring-0 focus:border-none p-0 h-7 border-none text-xs cursor-pointer select-none"
          value={value}
          onChange={(event) => {
            let value = +event.target.value;
            // Restrict value to valid range
            if (value < 0) value = 0;
            if (value > max) value = max;
            setLayer(({ layerProps, ...rest }) => ({
              ...rest,
              layerProps: {
                ...layerProps,
                selections: layerProps.selections.map((ch) => ch.with(axisIndex, value)),
              },
            }));
          }}
          type="number"
          id="max"
        />
      </PopoverContent>
    </Popover>
  );
}

export default AxisOptions;
