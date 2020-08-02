import { useRecoilState } from 'recoil';
import { Slider } from '@material-ui/core';

import { layerStateFamily } from '../../state';

function ChannelController({ id, index, min = 0, max = 60000 }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = value => {
    console.log(value)
    setLayer(([prevLayer, prevProps]) => {
      const sliderValues = [...prevProps.sliderValues];
      sliderValues[index] = [0, value];
      return [prevLayer, {...prevProps, sliderValues }];
    });
  }
  return (
    <Slider
      value={layer[1].sliderValues[index][1]}
      onChange={handleChange}
      min={min}
      max={max}
      step={1}
    />
  );
}

export default ChannelController;
