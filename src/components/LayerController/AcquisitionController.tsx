import { Grid, NativeSelect } from "@material-ui/core";
import React from "react";
import type { ChangeEvent } from "react";
import { useSourceData } from "../../hooks";

function AcquisitionController() {
  const [sourceData] = useSourceData();
  const { acquisitionId, acquisitions } = sourceData;

  if (!acquisitions) {
    return null;
  }

  const handleSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    let value = event.target.value;
    const url = new URL(window.location.href);
    if (value === "-1") {
      url.searchParams.delete("acquisition");
    } else {
      url.searchParams.set("acquisition", value);
    }
    window.location.href = decodeURIComponent(url.href);
  };

  return (
    <>
      <Grid>
        <NativeSelect fullWidth style={{ fontSize: "0.7em" }} onChange={handleSelectionChange} value={acquisitionId}>
          <option value="-1" key="-1">
            Filter by Acquisition
          </option>
          {acquisitions.map((acq) => {
            acq = acq as Ome.Acquisition;
            return (
              <option value={acq.id} key={acq.id}>
                Acquisition: {acq.name}
              </option>
            );
          })}
        </NativeSelect>
      </Grid>
    </>
  );
}

export default AcquisitionController;
