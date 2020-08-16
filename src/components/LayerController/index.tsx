import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import MuiAccordion from '@material-ui/core/Accordion';
import { withStyles } from '@material-ui/styles';

import { sourceInfoState, layerStateFamily } from '../../state';
import type { ImageLayerConfig } from '../../state';

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

function LayerController({ id }: { id: string }) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));

  useEffect(() => {
    async function initLayer(config: ImageLayerConfig) {
      const { loadImageConfig } = await import('../../io');
      const layerState = await loadImageConfig(config, id);
      setLayer(layerState);
    }
    if (id in sourceInfo) {
      const config = sourceInfo[id];
      initLayer(config);
    }
  }, [sourceInfo]);

  // If layer hasn't been initialized, don't render control.
  const { layerProps } = layer;
  if (!layerProps?.loader) return null;

  const { name = '' } = layer.metadata;
  return (
    <Accordion defaultExpanded>
      <Header id={id} name={name} />
      <Content id={id} nChannels={layerProps.loaderSelection.length} />
    </Accordion>
  );
}

export default LayerController;
