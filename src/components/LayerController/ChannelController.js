import { useRecoilState } from 'recoil';
import { Slider, Typography } from '@material-ui/core';

import { layerStateFamily } from '../../state';

function ChannelController({ id, index, min = 0, max = 255 }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = (event, value) => {
    setLayer(([prevLayer, prevProps]) => {
      // const sliderValues = prevProps.sliderValues.slice();
      // console.log(sliderValues[index]);
      // sliderValues[index] = value;
      // return [prevLayer, {...prevProps, sliderValues }];
      console.log(prevLayer, prevProps)
    });
  }
  return (
    <>
      <Typography gutterBottom>
        Channel {index}
      </Typography>
      <Slider
        value={layer[1].sliderValues[index]}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={min}
        max={max}
      />
    </>
  );
}

export default ChannelController;