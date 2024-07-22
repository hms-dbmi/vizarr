import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";

import AcquisitionSelect from "./AcquisitionController";
import AddChannelButton from "./AddChannelButton";
import ChannelController from "./ChannelController";
import AxisSlider from "./AxisSlider";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useLayer, useSourceValue } from "@/hooks";

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
            <label
              className="cursor-pointer"
              aria-label={`toggle visibility of ${name}`}
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                }
              }}
              onClick={(event) => {
                // prevent accordion from toggling
                event.stopPropagation();
              }}
            >
              {layer.on ? <EyeOpenIcon /> : <EyeNoneIcon />}
              <input
                type="checkbox"
                onChange={(event) => {
                  setLayer((prev) => {
                    const on = event.currentTarget.checked;
                    return { ...prev, on };
                  });
                }}
                checked={layer.on}
                className="hidden"
              />
            </label>
            <span className="ml-2 font-normal text-">{name}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col">
          {true ? (
            <>
              <AcquisitionSelect
                acquisitions={sourceInfo.acquisitions}
                acquisitionId={layer.layerProps.acquisitionId}
              />
              <Separator />
            </>
          ) : null}
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
          <Separator />
          <div>
            {sliders.map(([name, axisIndex, max]) => (
              <AxisSlider key={name} axisIndex={axisIndex} max={max} />
            ))}
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <label className="text-xs">channels:</label>
            <AddChannelButton />
          </div>
          <Separator />
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
