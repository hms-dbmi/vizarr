import { useRecoilState } from 'recoil';
import { Slider, Typography } from '@material-ui/core';

import { layerStateFamily } from '../../state';

function ChannelController({ id, index, min = 0, max = 1 }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = (e, v) => {
    setLayer(([prevLayer, prevProps]) => {
      const sliderValues = [...prevProps.sliderValues];
      sliderValues[index] = v;
      return [prevLayer, {...prevProps, sliderValues }];
    });
  }
  // Material slider tries to sort in place. Need to copy.
  const value = [...layer[1].sliderValues[index]];
  return (
    <>
      <Typography>
        Channel {index}
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={min}
        max={max}
        step={0.01}
      />
    </>
  );
}

export default ChannelController;