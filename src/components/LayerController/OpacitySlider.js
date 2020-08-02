import { useRecoilState } from 'recoil';
import { Slider } from '@material-ui/core';

import { layerStateFamily }from '../../state';

function OpacitySlider({ id }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = opacity => {
    setLayer(([prevLayer, prevProps]) => [prevLayer, {...prevProps, opacity }])
  }
  return (
    <Slider 
      value={layer[1].opacity}
      onChange={handleChange}
      min={0}
      max={1} 
      step={0.01}
    />
  )
}

export default OpacitySlider;