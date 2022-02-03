import React, { useState } from 'react';
import type { MouseEvent, ChangeEvent } from 'react';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { IconButton, Popover, Paper, Typography, Divider, Input, NativeSelect } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { MoreHoriz, Remove } from '@material-ui/icons';
import type { ControllerProps } from '../../state';
import ColorPalette from './ColorPalette';

const DenseInput = withStyles({
  root: {
    width: '5.5em',
    fontSize: '0.7em',
  },
})(Input);

interface Props {
  channelIndex: number;
}

function ChannelOptions({ sourceAtom, layerAtom, channelIndex }: ControllerProps<Props>) {
  const sourceData = useAtomValue(sourceAtom);
  const [layer, setLayer] = useAtom(layerAtom);
  const [anchorEl, setAnchorEl] = useState<null | Element>(null);
  const { channel_axis, names } = sourceData;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (rgb: [number, number, number]) => {
    setLayer((prev) => {
      const colors = [...prev.layerProps.colors];
      colors[channelIndex] = rgb;
      return { ...prev, layerProps: { ...prev.layerProps, colors } };
    });
  };

  const handleContrastLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetId = event.target.id;
    let value = +event.target.value;

    // Only let positive values
    if (value < 0) value = 0;

    setLayer((prev) => {
      // Need to move sliders in if contrast limits are narrower
      const contrastLimitsRange = [...prev.layerProps.contrastLimitsRange];
      const contrastLimits = [...prev.layerProps.contrastLimits];

      const [cmin, cmax] = contrastLimitsRange[channelIndex];
      const [smin, smax] = contrastLimits[channelIndex];

      // Calculate climit update
      const [umin, umax] = targetId === 'min' ? [value, cmax] : [cmin, value];

      // Update sliders if needed
      if (umin > smin) contrastLimits[channelIndex] = [umin, smax];
      if (umax < smax) contrastLimits[channelIndex] = [smin, umax];

      // Update channel constrast limits
      contrastLimits[channelIndex] = [umin, umax];

      return {
        ...prev,
        layerProps: { ...prev.layerProps, contrastLimits, contrastLimitsRange },
      };
    });
  };

  const handleRemove = () => {
    setLayer((prev) => {
      const { layerProps } = prev;
      const colors = [...layerProps.colors];
      const contrastLimits = [...layerProps.contrastLimits];
      const contrastLimitsRange = [...layerProps.contrastLimitsRange];
      const selections = [...layerProps.selections];
      const channelsVisible = [...layerProps.channelsVisible];
      colors.splice(channelIndex, 1);
      contrastLimits.splice(channelIndex, 1);
      contrastLimitsRange.splice(channelIndex, 1);
      selections.splice(channelIndex, 1);
      channelsVisible.splice(channelIndex, 1);
      return {
        ...prev,
        layerProps: {
          ...layerProps,
          colors,
          selections,
          channelsVisible,
          contrastLimits,
          contrastLimitsRange,
        },
      };
    });
  };

  const handleSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLayer((prev) => {
      const selections = [...prev.layerProps.selections];
      const channelSelection = [...selections[channelIndex]];
      if (Number.isInteger(channel_axis)) {
        channelSelection[channel_axis as number] = +event.target.value;
        selections[channelIndex] = channelSelection;
      }
      return { ...prev, layerProps: { ...prev.layerProps, selections } };
    });
  };

  const open = Boolean(anchorEl);
  const id = open ? `channel-${channelIndex}-${sourceData.name}-options` : undefined;
  const [min, max] = layer.layerProps.contrastLimitsRange[channelIndex];

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
            id={`layer-${sourceData.name}-channel-select`}
            onChange={handleSelectionChange}
            value={layer.layerProps.selections[channelIndex][channel_axis as number]}
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
