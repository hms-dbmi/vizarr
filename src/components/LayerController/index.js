import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import MuiAccordion from '@material-ui/core/Accordion';
import { withStyles } from '@material-ui/styles';
import { StaticImageLayer, VivViewerLayer } from '@hms-dbmi/viv';

import { sourceInfoState, layerStateFamily } from '../../state';
import { createZarrLoader, layersToVivProps, OMEMetaToVivProps } from '../../utils';

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
    async function initLayer({ store, imageData, dimensions, renderSettings, on = true }) {
      const { layers = [], opacity, colormap } = renderSettings;

      const loader = await createZarrLoader(store, dimensions);
      // Internal viv issue, this is a hack to get the appropriate WebGL textures.
      // Loader dtypes only have littleendian lookups, but all loaders return little endian
      // regardless of source.
      loader.dtype = '<' + loader.dtype.slice(1);
      // If there is metadata (from OME-Zarr) and no channels, parse the source info. Otherwise override.
      const vivProps = layers.length === 0 ? OMEMetaToVivProps(imageData) : layersToVivProps(layers);
      const Layer = loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
      return [Layer, { id, on, loader, colormap, opacity, ...vivProps }];
    }

    if (id in sourceInfo) {
      const layerInfo = sourceInfo[id];
      if (layerInfo.store) {
        initLayer(layerInfo).then((l) => setLayer(l));
      }
    }
  }, [sourceInfo]);

  // If layer hasn't been initialized, don't render control.
  const layerProps = layer[1];
  if (!layerProps?.loader) return null;

  const { name } = sourceInfo[id];
  return (
    <Accordion>
      <Header id={id} name={name} />
      <Content id={id} nChannels={layerProps.loaderSelection.length} />
    </Accordion>
  );
}

export default LayerController;
