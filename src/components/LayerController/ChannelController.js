import { useRecoilState } from 'recoil';
import { Slider, Typography, Grid, IconButton } from '@material-ui/core';
import { RadioButtonChecked, RadioButtonUnchecked } from '@material-ui/icons';

import ChannelOptions from './ChannelOptions';
import { layerStateFamily } from '../../state';

function ChannelController({ id, channelIndex }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleContrastChange = (e, v) => {
    setLayer(([prevLayer, prevProps]) => {
      const sliderValues = [...prevProps.sliderValues];
      sliderValues[channelIndex] = v;
      return [prevLayer, { ...prevProps, sliderValues }];
    });
  };
  const handleVisibilityChange = () => {
    setLayer(([prevLayer, prevProps]) => {
      const channelIsOn = [...prevProps.channelIsOn];
      channelIsOn[channelIndex] = !channelIsOn[channelIndex];
      return [prevLayer, { ...prevProps, channelIsOn }];
    });
  };
  // Material slider tries to sort in place. Need to copy.
  const layerProps = layer[1];
  const value = [...layerProps.sliderValues[channelIndex]];
  const { colormap } = layerProps;
  const color = `rgb(${colormap ? [255, 255, 255] : layerProps.colorValues[channelIndex]})`;
  const on = layerProps.channelIsOn[channelIndex];
  const [min, max] = layerProps.contrastLimits[channelIndex];
  const label = layerProps.labels?.[channelIndex];
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
