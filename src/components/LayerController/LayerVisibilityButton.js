import { useRecoilState } from 'recoil';
import { IconButton } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';

import { layerStateFamily } from '../../state';

function LayerVisibilityButton({ id }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const toggle = (e) => {
    e.stopPropagation();
    setLayer(([prevLayer, prevProps]) => {
      const on = !prevProps.on;
      return [prevLayer, {...prevProps, on }];
    });
  }
  const { on } = layer[1];
  return (
    <IconButton 
      aria-label="toggle layer visibility"
      onClick={toggle}
    >
      {on ? <Visibility /> : <VisibilityOff/>}
    </IconButton>
  );
}

export default LayerVisibilityButton;
