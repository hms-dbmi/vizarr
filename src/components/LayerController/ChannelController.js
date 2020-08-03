import { useRecoilState, useRecoilValue } from 'recoil';
import { Slider, Typography, Grid, IconButton } from '@material-ui/core';
import { RadioButtonChecked, RadioButtonUnchecked, MoreHoriz } from '@material-ui/icons';

import { layerStateFamily, sourceInfoState } from '../../state';

function ChannelController({ id, index, min = 0, max = 255 }) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleContrastChange = (e, v) => {
    setLayer(([prevLayer, prevProps]) => {
      const sliderValues = [...prevProps.sliderValues];
      sliderValues[index] = v;
      return [prevLayer, {...prevProps, sliderValues }];
    });
  }
  const handleVisibilityChange = () => {
    setLayer(([prevLayer, prevProps]) => {
      const channelIsOn = [...prevProps.channelIsOn];
      channelIsOn[index] = !channelIsOn[index];
      return [prevLayer, {...prevProps, channelIsOn }];
    });
  }
  // Material slider tries to sort in place. Need to copy.
  const layerProps = layer[1];
  const value = [...layerProps.sliderValues[index]];
  const { colormap } = layerProps;
  const color = `rgb(${colormap ? [255, 255, 255] : layerProps.colorValues[index]})`;
  const on = layerProps.channelIsOn[index];
  const channelName = `channel_${index}`;
  return (
    <>
      <Grid container justify='space-between' wrap="nowrap">
        <Grid item xs={8} zeroMinWidth>
          <Typography variant='caption' noWrap>
            {channelName}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <IconButton
              style={{ 
                backgroundColor: 'transparent',
                padding: 0,
              }} 
            >
            <MoreHoriz />
          </IconButton> 
        </Grid>
      </Grid>
      <Grid container justify='space-between'>
        <Grid item xs={2}>
          <IconButton
            style={{ 
              color,
              backgroundColor: 'transparent',
              padding: 0,
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
              padding: '9px 0px 5px 0px',
              color
            }}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default ChannelController;