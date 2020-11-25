import { Grid, NativeSelect } from '@material-ui/core';
import { useRecoilValue } from 'recoil';
import type { ChangeEvent } from 'react';
import type { Acquisition } from '../../state';

import { sourceInfoState } from '../../state';


function AcquisitionController({ layerId }: {layerId: string,}): JSX.Element | null {

    const sourceInfo = useRecoilValue(sourceInfoState);
    const { acquisitionId, acquisitions, source } = sourceInfo[layerId];

    if (!acquisitions) {
        return null;
    }

    const handleSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        let value = event.target.value;
        let acquisition = value === '-1' ? '' : `&acquisition=${value}`
        window.location.href = window.location.origin + `?source=${source}${acquisition}`;
    };

    return (
        <>
            <Grid>
                <NativeSelect
                    fullWidth
                    style={{ fontSize: '0.7em' }}
                    onChange={handleSelectionChange}
                    value={acquisitionId}
                >
                    <option value="-1" key="-1">
                        Filter by Acquisition
                    </option>
                    {acquisitions.map(acq => {
                        acq = acq as Acquisition;
                        return(
                            <option value={acq.id} key={acq.id}>
                                Acquisition: {acq.name}
                            </option>
                        )
                    })}
                </NativeSelect>
            </Grid>
        </>
    )
}

export default AcquisitionController;
