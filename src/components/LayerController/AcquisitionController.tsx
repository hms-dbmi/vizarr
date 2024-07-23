import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

function AcquisitionController(props: {
  acquisitionId: string | number | undefined;
  acquisitions: Array<Ome.Acquisition>;
}) {
  const {
    acquisitionId,
    acquisitions = [
      { id: "1", name: "testring a" },
      { id: 2, name: "testing 1,2,3" },
    ],
  } = props;
  const id = acquisitionId ? String(acquisitionId) : undefined;
  return (
    <Select
      value={id}
      onValueChange={(value: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set("acquisition", value);
        window.location.href = decodeURIComponent(url.href);
      }}
    >
      <SelectTrigger className="w-full focus:ring-0 p-0 h-7 border-none text-xs cursor-pointer select-none">
        <SelectValue placeholder="Filter by Acquisition" />
      </SelectTrigger>
      <SelectContent className="focus:ring-0 border-none">
        {acquisitions.map((acq) => (
          <SelectItem className="text-xs" value={String(acq.id)} key={acq.id}>
            Acquisition: {acq.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default AcquisitionController;
