import { useRecoilState } from 'recoil';
import type { MouseEvent } from 'react';
import { IconButton } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';

import { layerStateFamily } from '../../state';

function LayerVisibilityButton({ layerId }: { layerId: string }): JSX.Element {
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLayer((prev) => {
      const on = !prev.on;
      return { ...prev, on };
    });
  };
  const { on } = layer;
  return (
    <IconButton
      aria-label={`toggle-layer-visibility-${layerId}`}
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
