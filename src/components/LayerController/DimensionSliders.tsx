import { Grid, Divider } from '@material-ui/core';
import { useRecoilValue } from 'recoil';
import DimensionSlider from './DimensionSlider';
import { sourceInfoState } from '../../state';


function DimensionSliders({ layerId }: { layerId: string }): JSX.Element {
  const sourceInfo = useRecoilValue(sourceInfoState);
  let sizeZ = sourceInfo[layerId].loader._data.meta?.shape[3];
  let sizeT = sourceInfo[layerId].loader._data.meta?.shape[0];
  // sometimes 'meta' is not defined - default to size = 1
  sizeZ = sizeZ || 1;
  sizeT = sizeT || 1;
  if (sizeZ === 1 && sizeT === 1) {
    return <></>
  }

  return (
    <>
      <Grid>
        {sizeZ > 1 && <DimensionSlider layerId={layerId} dimension={'z'} max={sizeZ - 1} />}
        {sizeT > 1 && <DimensionSlider layerId={layerId} dimension={'t'} max={sizeT - 1} />}
      </Grid>
      <Divider />
    </>
  )
}

export default DimensionSliders;
