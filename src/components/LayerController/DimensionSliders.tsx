import { Grid, Divider } from '@material-ui/core';
import { useRecoilValue } from 'recoil';
import DimensionSlider from './DimensionSlider';
import { sourceInfoState } from '../../state';


function DimensionSliders({ layerId }: { layerId: string }): JSX.Element {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const { dimensionNames, channel_axis, loader } = sourceInfo[layerId];

  const sliders = dimensionNames
    .slice(0, -2) // ignore last two dimensions, [y,x]
    .map((name, i) => ([name, i, loader.base.shape[i]])) // capture the name, index, and size of non-yx dims
    .filter(d => {
      if (d[1] === channel_axis) return false; // ignore channel_axis (for OME-Zarr channel_axis === 1)
      if (d[2] > 1) return true; // keep if size > 1
      return false; // otherwise ignore as well
    })
    .map(([name, i, size]) => <DimensionSlider key={name} layerId={layerId} dimIndex={i} index={i} max={size - 1} />);

  if (sliders.length === 0) return null;
  return (
    <>
      <Grid>
        {sliders}
      </Grid>
      <Divider />
    </>
  )
}

export default DimensionSliders;
