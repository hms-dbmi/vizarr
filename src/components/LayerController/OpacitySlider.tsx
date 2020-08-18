import { useRecoilState } from 'recoil';
import type { ChangeEvent } from 'react';
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

function OpacitySlider({ layerId }: { layerId: string }): JSX.Element {
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const handleChange = (_: ChangeEvent<unknown>, value: number | number[]) => {
    const opacity = value as number;
    setLayer((prev) => ({ ...prev, layerProps: { ...prev.layerProps, opacity } }));
  };
  return <DenseSlider value={layer.layerProps.opacity} onChange={handleChange} min={0} max={1} step={0.01} />;
}

export default OpacitySlider;
