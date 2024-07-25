import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, color, ...props }, ref) => {
  const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-[2.5px] w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderPrimitive.Range style={{ backgroundColor: color }} className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {initialValue.map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Ok because the array is static
        <React.Fragment key={index}>
          <SliderPrimitive.Thumb
            style={{ backgroundColor: color }}
            className="cursor-pointer block h-3 w-1 bg-current shadow transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          />
        </React.Fragment>
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
