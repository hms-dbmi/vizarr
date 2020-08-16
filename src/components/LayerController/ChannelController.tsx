import { useRecoilState } from 'recoil';
import type { ChangeEvent } from 'react';
import { Slider, Typography, Grid, IconButton } from '@material-ui/core';
import { RadioButtonChecked, RadioButtonUnchecked } from '@material-ui/icons';

import ChannelOptions from './ChannelOptions';
import { layerStateFamily } from '../../state';

interface ChannelConfig {
  id: string;
  channelIndex: number;
}

function ChannelController({ id, channelIndex }: ChannelConfig) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleContrastChange = (_: ChangeEvent<{}>, v: number | number[]) => {
    setLayer((prev) => {
      const sliderValues = [...prev.layerProps.sliderValues];
      sliderValues[channelIndex] = v as number[];
      return { ...prev, layerProps: { ...prev.layerProps, sliderValues } };
    });
  };
  const handleVisibilityChange = () => {
    setLayer((prev) => {
      const channelIsOn = [...prev.layerProps.channelIsOn];
      channelIsOn[channelIndex] = !channelIsOn[channelIndex];
      return { ...prev, layerProps: { ...prev.layerProps, channelIsOn } };
    });
  };
  // Material slider tries to sort in place. Need to copy.
  const { layerProps, metadata } = layer;
  const value = [...layerProps.sliderValues[channelIndex]];
  const { colormap } = layerProps;
  const color = `rgb(${colormap ? [255, 255, 255] : layerProps.colorValues[channelIndex]})`;
  const on = layerProps.channelIsOn[channelIndex];
  const [min, max] = metadata.contrastLimits[channelIndex];
  const label = metadata.labels[channelIndex];
  return (
    <>
      <Grid container justify="space-between" wrap="nowrap">
        <Grid item xs={10}>
          <div style={{ width: 165, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Typography variant="caption" noWrap>
              {label}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={1}>
          <ChannelOptions layerId={id} channelIndex={channelIndex} />
        </Grid>
      </Grid>
      <Grid container justify="space-between">
        <Grid item xs={2}>
          <IconButton
            style={{
              color,
              backgroundColor: 'transparent',
              padding: 0,
              zIndex: 2,
            }}
            onClick={handleVisibilityChange}
          >
            {on ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
          </IconButton>
        </Grid>
        <Grid item xs={10}>
          <Slider
            value={value}
            onChange={handleContrastChange}
            min={min}
            max={max}
            step={0.01}
            style={{
              padding: '10px 0px 5px 0px',
              color,
            }}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default ChannelController;
