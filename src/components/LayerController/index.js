import { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Grid,
  Typography
} from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { ExpandMore } from '@material-ui/icons';
import { StaticImageLayer, VivViewerLayer } from '@hms-dbmi/viv';

import { sourceInfoState, layerStateFamily }from '../../state';
import { createZarrLoader, channelsToVivProps, OMEMetaToVivProps } from '../../utils';

import LayerVisibilityButton from './LayerVisibilityButton';
import OpacitySlider from './OpacitySlider';
import ChannelController from './ChannelController';


const StyledAccordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(Accordion);

function LayerControl({ label, children }) {
  return (
    <Grid   
      container
      direction="row"
      justify="center"
      alignItems="space-between"
      style={{ width: "100%" }}
    >
      <Grid item>
        <Typography>{label}:</Typography>
      </Grid>
      <Grid item>
        {children}
      </Grid>
    </Grid>
  );
}

function LayerController({ id }) {
  const sourceInfo = useRecoilValue(sourceInfoState);
  const [layer, setLayer] = useRecoilState(layerStateFamily(id));

  useEffect(() => {
    async function initLayer({
      source,
      dimensions,
      channels,
      colormap = '',
      opacity = 1,
      on = true,
    }) {
      const { loader, metadata = null } = await createZarrLoader(source, dimensions);
      // Internal viv issue, this is a hack to get the appropriate WebGL textures.
      // Loader dtypes only have littleendian lookups, but all loaders return little endian
      // regardless of source.
      loader.dtype = '<' + loader.dtype.slice(1);
      // If there is metadata (from OME-Zarr) and no channels, parse the source info. Otherwise override.
      const vivProps = metadata && !channels ?
        OMEMetaToVivProps(metadata) :
        channelsToVivProps(channels);

      const Layer = loader.numLevels === 1 ? StaticImageLayer : VivViewerLayer;
      return [Layer, { id, on, loader, colormap, opacity, ...vivProps }];
    }

    if (id in sourceInfo) {
      const layerInfo = sourceInfo[id];
      initLayer(layerInfo).then(l => setLayer(l));
    }

  }, [sourceInfo])

  // If layer hasn't been initialized, don't render control.
  const layerProps = layer[1];
  if (!layerProps?.loader) return null;

  const { name } = sourceInfo[id];
  const { loaderSelection } = layerProps;
  const label = `layer-controoler-${id}`;
  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls={label}
        id={label}
        disableRipple
      >
        <LayerVisibilityButton id={id}/>
        <Typography>{name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container>
          <LayerControl label={"opacity"}>
            <OpacitySlider id={id} /> 
          </LayerControl>
          {loaderSelection.map((_, i) => <ChannelController id={id} index={i} key={i + id} />)}
        </Grid>
      </AccordionDetails> 
    </StyledAccordion>
  );
}

export default LayerController;
