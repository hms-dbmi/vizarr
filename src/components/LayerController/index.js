import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import MuiAccordion from '@material-ui/core/Accordion';
import { withStyles } from '@material-ui/styles';
import { StaticImageLayer, VivViewerLayer } from '@hms-dbmi/viv';

import { sourceInfoState, layerStateFamily } from '../../state';

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

function LayerController({ id }) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));

  useEffect(() => {
    async function initLayer(vivProps) {
      const Layer = vivProps.loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
      return [Layer, { id, ...vivProps, on: true }];
    }
    if (id in sourceInfo) {
      const layerInfo = sourceInfo[id];
      initLayer(layerInfo).then(setLayer);
    }
  }, [sourceInfo]);

  // If layer hasn't been initialized, don't render control.
  const layerProps = layer[1];
  if (!layerProps?.loader) return null;

  const { name } = sourceInfo[id];
  return (
    <Accordion defaultExpanded>
      <Header id={id} name={name} />
      <Content id={id} nChannels={layerProps.loaderSelection.length} />
    </Accordion>
  );
}

export default LayerController;
