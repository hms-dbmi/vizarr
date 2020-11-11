import { Grid, NativeSelect } from '@material-ui/core';
import { useRecoilValue } from 'recoil';
import type { ChangeEvent } from 'react';

import { sourceInfoState } from '../../state';


function AcquisitionController({ layerId }: {layerId: string,}): JSX.Element | null {

    const sourceInfo = useRecoilValue(sourceInfoState);
    const { acquisition, acquisitions, source } = sourceInfo[layerId];

    if (!acquisitions) {
        return null;
    }

    const handleSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        console.log('event.target.value', event.target.value);
        console.log('source', source);
        let acquisition = event.target.value;
        window.location.href = window.location.origin + `?source=${source}&acquisition=${acquisition}`;
    };

    return (
        <>
            <Grid>
                <NativeSelect
                    fullWidth
                    style={{ fontSize: '0.7em' }}
                    // id={`layer-${layerId}-channel-select`}
                    onChange={handleSelectionChange}
                    value={acquisition}
                >
                    <option value="-1" key="-1">
                        Filter by Acquisition
                    </option>
                    {acquisitions.map((acq) => (
                        <option value={acq.id} key={acq.id}>
                            Acquisition: {acq.name}
                        </option>
                    ))}
                </NativeSelect>
            </Grid>
        </>
    )
}

export default AcquisitionController;
