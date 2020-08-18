import { useRecoilState, useRecoilValue } from 'recoil';
import type { ChangeEvent } from 'react';
import { Slider, Typography, Grid, IconButton } from '@material-ui/core';
import { RadioButtonChecked, RadioButtonUnchecked } from '@material-ui/icons';

import ChannelOptions from './ChannelOptions';
import { layerStateFamily, sourceInfoState } from '../../state';

interface ChannelConfig {
  layerId: string;
  channelIndex: number;
}

function ChannelController({ layerId, channelIndex }: ChannelConfig): JSX.Element {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));

  const handleContrastChange = (_: ChangeEvent<unknown>, v: number | number[]) => {
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

  const { sliderValues, colorValues, contrastLimits, channelIsOn, colormap, loaderSelection } = layer.layerProps;

  // Material slider tries to sort in place. Need to copy.
  const value = [...sliderValues[channelIndex]];
  const color = `rgb(${colormap ? [255, 255, 255] : colorValues[channelIndex]})`;
  const on = channelIsOn[channelIndex];
  const [min, max] = contrastLimits[channelIndex];

  const { channel_axis, names } = sourceInfo[layerId];
  const selection = loaderSelection[channelIndex];
  const nameIndex = Number.isInteger(channel_axis) ? selection[channel_axis as number] : 0;
  const label = names[nameIndex];
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
          <ChannelOptions layerId={layerId} channelIndex={channelIndex} />
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
