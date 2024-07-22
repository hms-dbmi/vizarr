import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import AcquisitionController from "./AcquisitionController";
import AddChannelButton from "./AddChannelButton";
import ChannelController from "./ChannelController";
import { useLayer, useSourceValue } from "@/hooks";
import AxisSlider from "./AxisSlider";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";

function LayerController() {
  const sourceInfo = useSourceValue();
  const [layer, setLayer] = useLayer();
  const nChannels = layer.layerProps.selections.length;
  const { axis_labels, channel_axis, loader, name = "" } = sourceInfo;
  const sliders = axis_labels
    .slice(0, -2) // ignore last two axes, [y,x]
    .map((name, i) => [name, i, loader[0].shape[i]] as const)
    .filter(([_, idx, size]) => {
      // ignore channel_axis (for OME-Zarr channel_axis === 1)
      if (idx === channel_axis) return false;
      // keep if size > 1
      return size > 1;
    });
  return (
    <Accordion defaultValue={name} type="single" collapsible className="w-52">
      <AccordionItem value={name} className="border-none">
        <AccordionTrigger className="flex py-0 pr-1 bg-border hover:no-underline">
          <div className="flex items-center">
            <Button
              className="cursor-pointer"
              aria-label={`toggle visibility of ${name}`}
              onClick={(event) => {
                event.stopPropagation(); // prevent accordion from toggling
                setLayer((prev) => {
                  const on = !prev.on;
                  return { ...prev, on };
                });
              }}
              variant="ghost"
              size="icon-sm"
            >
              {layer.on ? <EyeOpenIcon /> : <EyeNoneIcon />}
            </Button>
            <span className="ml-2">{name}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col">
          <hr className="border-t-1 border-accent" />
          <AcquisitionController />
          <div className="flex items-center my-0.5">
            <label className="text-xs">opacity:</label>
            <Slider
              className="ml-2 mt-0.5"
              value={[layer.layerProps.opacity]}
              onValueChange={(update) => {
                const [opacity] = update;
                setLayer((prev) => ({ ...prev, layerProps: { ...prev.layerProps, opacity } }));
              }}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
          <hr className="border-t-1 border-accent" />
          <div>
            {sliders.map(([name, axisIndex, max]) => (
              <AxisSlider key={name} axisIndex={axisIndex} max={max} />
            ))}
          </div>
          <hr className="border-t-1 border-accent" />
          <div className="flex justify-between items-center">
            <label>channels:</label>
            <AddChannelButton />
          </div>
          <hr className="border-t-1 border-accent" />
          <div>
            {Array.from({ length: nChannels }).map((_, i) => (
              <ChannelController channelIndex={i} key={`${name}-${i}`} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default LayerController;
