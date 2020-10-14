import { Grid, Typography, Divider } from '@material-ui/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import type { ChangeEvent } from 'react';
import { Slider } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import DimensionOptions from './DimensionOptions';

import { layerStateFamily, sourceInfoState } from '../../state';

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


function DimensionSlider({ layerId, dimIndex, max }: {
  layerId: string,
  dimIndex: number,
  max: number
}): JSX.Element {
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));
  const sourceInfo = useRecoilValue(sourceInfoState);
  const { dimensionNames } = sourceInfo[layerId];
  const dimension = dimensionNames[dimIndex];

  console.log('DimensionSlider layer', layer);

  const handleChange = (_: ChangeEvent<unknown>, value: number | number[]) => {
    const index = value as number;
    setLayer((prev) => {
      let layerProps = { ...prev.layerProps }      
        // for each channel, update index
        layerProps.loaderSelection = layerProps.loaderSelection.map(ch => {
          let new_ch = [...ch];
          new_ch[dimIndex] = value;
          return new_ch;
        });
      return { ...prev, layerProps };
    })
  };

  // Use first channel to get initial value of slider
  let value = layer.layerProps.loaderSelection[0] ? layer.layerProps.loaderSelection[0][dimIndex] : 1;

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
            <DimensionOptions layerId={layerId} dimIndex={dimIndex} max={max} />
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
