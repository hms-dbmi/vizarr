import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import MuiAccordion from '@material-ui/core/Accordion';
import { withStyles } from '@material-ui/styles';

import { sourceInfoState, layerStateFamily } from '../../state';
import type { SourceData } from '../../state';

import Header from './Header';
import Content from './Content';

const Accordion = withStyles({
  root: {
    borderBottom: '1px solid rgba(150, 150, 150, .2)',
    width: 200,
    boxshadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 0,
      padding: 0,
    },
  },
  expanded: {
    padding: 1,
  },
})(MuiAccordion);

function LayerController({ layerId }: { layerId: string }): JSX.Element {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(layerId));

  useEffect(() => {
    async function initLayer(sourceData: SourceData) {
      const { initLayerStateFromSource } = await import('../../io');
      const initialLayerState = await initLayerStateFromSource(sourceData, layerId);
      setLayer(initialLayerState);
    }
    // Loader only defined once layer state is initialized.
    if (layerId in sourceInfo && !layer.layerProps.loader) {
      const config = sourceInfo[layerId];
      initLayer(config);
    }
  }, [sourceInfo]);

  const { name = '' } = sourceInfo[layerId];
  const nChannels = layer.layerProps.loaderSelection.length;
  return (
    <Accordion defaultExpanded>
      <Header layerId={layerId} name={name} />
      <Content layerId={layerId} nChannels={nChannels} />
    </Accordion>
  );
}

export default LayerController;
