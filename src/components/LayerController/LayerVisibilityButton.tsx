import { useRecoilState } from 'recoil';
import type { MouseEvent } from 'react';
import { IconButton } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';

import { layerStateFamily } from '../../state';

function LayerVisibilityButton({ id }: { id: string }) {
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLayer((prev) => {
      const on = !prev.metadata.on;
      return { ...prev, metadata: { ...prev.metadata, on } };
    });
  };
  const { on } = layer.metadata;
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
