import { useState } from 'react';
import type { MouseEvent, ChangeEvent } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconButton, Popover, Paper, Typography, Divider, NativeSelect } from '@material-ui/core';
import { Add } from '@material-ui/icons';

import { layerStateFamily, sourceInfoState } from '../../state';
import { hexToRGB, MAX_CHANNELS } from '../../utils';

function AddChannelButton({ layerId }: { layerId: string }): JSX.Element {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const [anchorEl, setAnchorEl] = useState<null | Element>(null);
  const layerInfo = sourceInfo[layerId];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const {
      defaults: { selection },
      channel_axis,
      colors,
      contrast_limits,
    } = layerInfo;
    handleClose();
    const channelIndex = +event.target.value;
    const channelSelection = [...selection];
    if (channel_axis) {
      channelSelection[channel_axis] = channelIndex;
    }
    setLayer((prev) => {
      const { layerProps } = prev;
      const loaderSelection = [...layerProps.loaderSelection, channelSelection];
      const colorValues = [...layerProps.colorValues, hexToRGB(colors[channelIndex])];
      const sliderValues = [...layerProps.sliderValues, contrast_limits[channelIndex]];
      const contrastLimits = [...sliderValues];
      const channelIsOn = [...layerProps.channelIsOn, true];
      return {
        ...prev,
        layerProps: {
          ...layerProps,
          loaderSelection,
          colorValues,
          sliderValues,
          contrastLimits,
          channelIsOn,
        },
      };
    });
  };

  const { names } = sourceInfo[layerId];
  const open = Boolean(anchorEl);
  const id = open ? `layer-${layerId}-add-channel` : undefined;
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
        disabled={layer.layerProps.loaderSelection.length === MAX_CHANNELS}
      >
        <Add />
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
        <Paper style={{ padding: '0px 4px', marginBottom: 4, width: '8em' }}>
          <Typography variant="caption">selection: </Typography>
          <Divider />
          <NativeSelect
            fullWidth
            style={{ fontSize: '0.7em' }}
            id={`layer-${layerId}-channel-select`}
            onChange={handleChange}
          >
            <option aria-label="None" value="">
              None
            </option>
            {names.map((name, i) => (
              <option value={i} key={name}>
                {name}
              </option>
            ))}
          </NativeSelect>
        </Paper>
      </Popover>
    </>
  );
}

export default AddChannelButton;
