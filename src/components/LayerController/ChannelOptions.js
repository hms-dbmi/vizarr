import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { IconButton, Popover, Paper, Typography, Divider, Input } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { MoreHoriz } from '@material-ui/icons';

import { layerStateFamily } from '../../state';
import ColorPalette from './ColorPalette';

const DenseInput = withStyles({
  root: {
    width: '9em',
    fontSize: '0.7em',
  },
  underline: {
    '&:before': {
      transition: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
    },
    '&:after': {
      transition: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
    },
  },
})(Input);

function ChannelOptions({ layerId, channelIndex }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (rgb) => {
    setLayer(([prevLayer, prevProps]) => {
      const colorValues = [...prevProps.colorValues];
      colorValues[channelIndex] = rgb;
      return [prevLayer, { ...prevProps, colorValues }];
    });
  };

  const handleContrastLimitChange = (e) => {
    const targetId = e.target.id;
    let value = +e.target.value;

    // Only let positive values
    if (value < 0) value = 0;

    setLayer(([prevLayer, prevProps]) => {
      // Need to move sliders in if contrast limits are narrower
      const contrastLimits = [...prevProps.contrastLimits];
      const sliderValues = [...prevProps.sliderValues];

      const [cmin, cmax] = contrastLimits[channelIndex];
      const [smin, smax] = sliderValues[channelIndex];

      // Calculate climit update
      const [umin, umax] = targetId === 'min' ? [value, cmax] : [cmin, value];

      // Update sliders if needed
      if (umin > smin) sliderValues[channelIndex] = [umin, smax];
      if (umax < smax) sliderValues[channelIndex] = [smin, umax];

      // Update channel constrast limits
      contrastLimits[channelIndex] = [umin, umax];

      return [prevLayer, { ...prevProps, contrastLimits, sliderValues }];
    });
  };

  const open = Boolean(anchorEl);
  const id = open ? `channel-${channelIndex}-${layerId}-options` : undefined;
  const [min, max] = layer[1].contrastLimits[channelIndex];
  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-describedby={id}
        style={{
          backgroundColor: 'transparent',
          padding: 0,
          zIndex: 2,
          pointer: 'cursor',
        }}
      >
        <MoreHoriz />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onMouseLeave={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper style={{ padding: '0px 4px', marginBotton: 4 }}>
          <Typography variant="caption">color:</Typography>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ColorPalette handleChange={handleColorChange} />
          </div>
          <Divider />
          <Typography variant="caption">contrast limits:</Typography>
          <Divider />
          <DenseInput value={min} onChange={handleContrastLimitChange} type="number" id="min" fullWidth={false} />
          <Divider />
          <DenseInput value={max} onChange={handleContrastLimitChange} type="number" id="max" fullWidth={false} />
        </Paper>
      </Popover>
    </>
  );
}

export default ChannelOptions;
