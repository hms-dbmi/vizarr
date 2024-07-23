import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import AcquisitionSelect from "./AcquisitionController";
import AddChannelButton from "./AddChannelButton";
import AxisSlider from "./AxisSlider";
import ChannelController from "./ChannelController";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useLayer, useSourceValue } from "@/hooks";

/** Get the { name, idx, size } for each axis that is not the channel_axis and has size > 1 */
function axisSliders(info: {
  axis_labels: string[];
  channel_axis: number | null;
  loader: Array<{ shape: number[] }>;
}): Array<{ name: string; idx: number; size: number }> {
  const { axis_labels, channel_axis, loader } = info;
  return axis_labels
    .slice(0, -2) // ignore last two axes, [y,x]
    .map((name, idx) => ({ name, idx, size: loader[0].shape[idx] }))
    .filter(({ idx, size }) => {
      // ignore channel_axis (for OME-Zarr channel_axis === 1)
      if (idx === channel_axis) return false;
      // keep if size > 1
      return size > 1;
    });
}

function LayerController() {
  const info = useSourceValue();
  const [layer, setLayer] = useLayer();
  const nChannels = layer.layerProps.selections.length;
  const { name = "" } = info;
  return (
    <Accordion defaultValue={name} type="single" collapsible className="w-52">
      <AccordionItem value={name} className="border-none">
        <AccordionTrigger className="flex px-1 pb-1 pt-1.5 -mt-2 bg-border hover:no-underline">
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
        <AccordionContent className="flex flex-col pb-0">
          {(info.acquisitions?.length ?? 0) > 0 ? (
            <>
              {/* biome-ignore lint/style/noNonNullAssertion: Ok because we assert above */}
              <AcquisitionSelect acquisitions={info.acquisitions!} acquisitionId={info.acquisitionId} />
              <Separator />
            </>
          ) : null}
          <div className="flex items-center my-0.5">
            <label className="text-xs">opacity:</label>
            <Slider
              className="ml-2 mt-0.5 mx-1"
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
          {axisSliders(info).map(({ name, idx, size }) => (
            <AxisSlider key={name} axisIndex={idx} max={size - 1} />
          ))}
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
