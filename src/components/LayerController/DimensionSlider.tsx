import { Grid, Typography, Divider } from '@material-ui/core';
import { useRecoilState } from 'recoil';
import type { ChangeEvent } from 'react';
import { Slider } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import DimensionOptions from './DimensionOptions';

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


function DimensionSlider({ layerId, dimension, max }: {
    layerId: string,
    dimension: string,
    max: number }): JSX.Element {
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const handleChange = (_: ChangeEvent<unknown>, value: number | number[]) => {
    const index = value as number;
    setLayer((prev) => {
      let layerProps = { ...prev.layerProps }
      if (dimension === 'z') {
        layerProps.z_index = index;
      } else {
        layerProps.t_index = index;
      }
      return { ...prev, layerProps };
    })
  };

  let value;
  if (dimension === 'z') {
    value = layer.layerProps.z_index;
  } else {
    value = layer.layerProps.t_index;
  }

  return (
    <>
      <Grid>
        <Grid container justify="space-between">
          <Grid item xs={10}>
            <div style={{ width: 165, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography variant="caption" noWrap>
                {dimension.toUpperCase()}: {value}/{max}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={1}>
            <DimensionOptions layerId={layerId} dimension={dimension} max={max}/>
          </Grid>
        </Grid>
        <Grid container justify="space-between">
          <Grid item xs={12}>
            <DenseSlider value={value} onChange={handleChange} min={0} max={max} step={1} />
          </Grid>
        </Grid>
      </Grid>
      <Divider />
    </>
  )
}

export default DimensionSlider;
