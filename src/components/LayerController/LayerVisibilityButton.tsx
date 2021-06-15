import React from 'react';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import type { MouseEvent } from 'react';
import { IconButton } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';

import type { AtomPairs } from '../../state';

function LayerVisibilityButton({ sourceAtom, layerAtom }: AtomPairs): JSX.Element {
  const sourceData = useAtomValue(sourceAtom);
  const [layer, setLayer] = useAtom(layerAtom);
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
      aria-label={`toggle-layer-visibility-${sourceData.id}`}
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
