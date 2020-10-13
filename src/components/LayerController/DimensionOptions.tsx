import { useState } from 'react';
import type { MouseEvent, ChangeEvent } from 'react';
import { useRecoilState } from 'recoil';
import { IconButton, Popover, Paper, Typography, Divider, Input } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { MoreHoriz } from '@material-ui/icons';

import { layerStateFamily } from '../../state';

const DenseInput = withStyles({
    root: {
        width: '5.5em',
        fontSize: '0.7em',
    },
})(Input);

function DimensionOptions({ layerId, dimension, max }: {
    layerId: string, dimension: string,
    max: number }): JSX.Element {
    const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
    const [anchorEl, setAnchorEl] = useState<null | Element>(null);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleIndexChange = (event: ChangeEvent<HTMLInputElement>) => {
        let value = +event.target.value;
        // Restrict value to valid range
        if (value < 0) value = 0;
        if (value > max) value = max;

        setLayer((prev) => {
            let layerProps = { ...prev.layerProps }
            if (dimension === 'z') {
                layerProps.z_index = value;
            } else {
                layerProps.t_index = value;
            }

            return {...prev, layerProps};
        });
    };

    const open = Boolean(anchorEl);
    const id = open ? `${dimension}-index-${layerId}-options` : undefined;;
    let value;
    if (dimension === 'z') {
        value = layer.layerProps.z_index;
    } else {
        value = layer.layerProps.t_index;
    }

    return (
        <>
            <IconButton
                onClick={handleClick}
                aria-describedby={id}
                style={{
                    backgroundColor: 'transparent',
                    padding: 0,
                    zIndex: 2,
                    cursor: 'pointer',
                }}
            >
                <MoreHoriz />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Paper style={{ padding: '0px 4px', marginBottom: 4 }}>
                    <Typography variant="caption">{dimension.toUpperCase()} index:</Typography>
                    <Divider />
                    <DenseInput value={value} onChange={handleIndexChange} type="number" id="max" fullWidth={false} />
                    <Divider />
                </Paper>
            </Popover>
        </>
    );
}

export default DimensionOptions;
