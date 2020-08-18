import { useState } from 'react';
import type { MouseEvent, ChangeEvent } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconButton, Popover, Paper, Typography, Divider, Input, NativeSelect } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { MoreHoriz, Remove } from '@material-ui/icons';

import { layerStateFamily, sourceInfoState } from '../../state';
import ColorPalette from './ColorPalette';

const DenseInput = withStyles({
  root: {
    width: '5.5em',
    fontSize: '0.7em',
  },
})(Input);

function ChannelOptions({ layerId, channelIndex }: { layerId: string; channelIndex: number }): JSX.Element {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const [anchorEl, setAnchorEl] = useState<null | Element>(null);
  const { channel_axis, names } = sourceInfo[layerId];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (rgb: number[]) => {
    setLayer((prev) => {
      const colorValues = [...prev.layerProps.colorValues];
      colorValues[channelIndex] = rgb;
      return { ...prev, layerProps: { ...prev.layerProps, colorValues } };
    });
  };

  const handleContrastLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetId = event.target.id;
    let value = +event.target.value;

    // Only let positive values
    if (value < 0) value = 0;

    setLayer((prev) => {
      // Need to move sliders in if contrast limits are narrower
      const contrastLimits = [...prev.layerProps.contrastLimits];
      const sliderValues = [...prev.layerProps.sliderValues];

      const [cmin, cmax] = contrastLimits[channelIndex];
      const [smin, smax] = sliderValues[channelIndex];

      // Calculate climit update
      const [umin, umax] = targetId === 'min' ? [value, cmax] : [cmin, value];

      // Update sliders if needed
      if (umin > smin) sliderValues[channelIndex] = [umin, smax];
      if (umax < smax) sliderValues[channelIndex] = [smin, umax];

      // Update channel constrast limits
      contrastLimits[channelIndex] = [umin, umax];

      return {
        ...prev,
        layerProps: { ...prev.layerProps, sliderValues, contrastLimits },
      };
    });
  };

  const handleRemove = () => {
    setLayer((prev) => {
      const { layerProps } = prev;
      const colorValues = [...layerProps.colorValues];
      const sliderValues = [...layerProps.sliderValues];
      const contrastLimits = [...layerProps.contrastLimits];
      const loaderSelection = [...layerProps.loaderSelection];
      const channelIsOn = [...layerProps.channelIsOn];
      colorValues.splice(channelIndex, 1);
      sliderValues.splice(channelIndex, 1);
      contrastLimits.splice(channelIndex, 1);
      loaderSelection.splice(channelIndex, 1);
      channelIsOn.splice(channelIndex, 1);
      return {
        ...prev,
        layerProps: {
          ...layerProps,
          colorValues,
          sliderValues,
          loaderSelection,
          channelIsOn,
          contrastLimits,
        },
      };
    });
  };

  const handleSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLayer((prev) => {
      const loaderSelection = [...prev.layerProps.loaderSelection];
      const channelSelection = [...loaderSelection[channelIndex]];
      if (Number.isInteger(channel_axis)) {
        channelSelection[channel_axis as number] = +event.target.value;
        loaderSelection[channelIndex] = channelSelection;
      }
      return { ...prev, layerProps: { ...prev.layerProps, loaderSelection } };
    });
  };

  const open = Boolean(anchorEl);
  const id = open ? `channel-${channelIndex}-${layerId}-options` : undefined;
  const [min, max] = layer.layerProps.contrastLimits[channelIndex];

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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">remove:</Typography>
            <IconButton onClick={handleRemove}>
              <Remove />
            </IconButton>
          </div>
          <Divider />
          <Typography variant="caption">selection:</Typography>
          <Divider />
          <NativeSelect
            fullWidth
            style={{ fontSize: '0.7em' }}
            id={`layer-${layerId}-channel-select`}
            onChange={handleSelectionChange}
            value={layer.layerProps.loaderSelection[channelIndex][channel_axis as number]}
          >
            {names.map((name, i) => (
              <option value={i} key={name}>
                ({i}) {name}
              </option>
            ))}
          </NativeSelect>
          <Divider />
          <Typography variant="caption">contrast limits:</Typography>
          <Divider />
          <DenseInput value={min} onChange={handleContrastLimitChange} type="number" id="min" fullWidth={false} />
          <DenseInput value={max} onChange={handleContrastLimitChange} type="number" id="max" fullWidth={false} />
          <Divider />
          <Typography variant="caption">color:</Typography>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ColorPalette handleChange={handleColorChange} />
          </div>
        </Paper>
      </Popover>
    </>
  );
}

export default ChannelOptions;
