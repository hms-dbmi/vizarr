import { useRecoilState } from 'recoil';
import { Slider } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { layerStateFamily } from '../../state';

const DenseSlider = withStyles({
  root: {
    color: 'white',
    padding: '10px 0px 5px 0px',
    marginRight: '5px',
  },
  active: {
    boxshadow: '0px 0px 0px 8px rgba(158, 158, 158, 0.16)',
  },
})(Slider);

function OpacitySlider({ id }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const handleChange = (e, opacity) => {
    setLayer(([prevLayer, prevProps]) => [prevLayer, { ...prevProps, opacity }]);
  };
  return <DenseSlider boxShadow={0} value={layer[1].opacity} onChange={handleChange} min={0} max={1} step={0.01} />;
}

export default OpacitySlider;
