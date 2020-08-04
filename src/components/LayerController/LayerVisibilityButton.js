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
      return [prevLayer, { ...prevProps, on }];
    });
  };
  const { on } = layer[1];
  return (
    <IconButton
      aria-label={`toggle-layer-visibility-${id}`}
      onClick={toggle}
      style={{
        backgroundColor: 'transparent',
        marginTop: '2px',
        color: `rgb(255, 255, 255, ${on ? 1 : 0.5})`,
      }}
    >
      {on ? <Visibility /> : <VisibilityOff />}
    </IconButton>
  );
}

export default LayerVisibilityButton;
