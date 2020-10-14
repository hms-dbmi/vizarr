import { Grid, Divider } from '@material-ui/core';
import { useRecoilValue } from 'recoil';
import DimensionSlider from './DimensionSlider';
import { sourceInfoState } from '../../state';


function DimensionSliders({ layerId }: { layerId: string }): JSX.Element {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const { shape } = sourceInfo[layerId].loader.base;
  let sizeZ = shape[2];
  let sizeT = shape[0];
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
