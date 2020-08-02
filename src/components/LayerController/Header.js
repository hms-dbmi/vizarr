import { AccordionSummary, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import LayerVisibilityButton from './LayerVisibilityButton';

const DenseAccordionSummary = withStyles({
  root: {
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    padding: '0 3px',
    height: 30,
    minHeight: 30,
    overflow: 'hidden',
    transition: 'none',
    '&$expanded': {
      minHeight: 30,
    },
  },
  content: {
    margin: 0,
    '&$expanded': {
      margin: 0,
    },
  },
  expanded: {},
})(AccordionSummary);

function Header({ id, name }) {
  const label = `layer-controller-${id}`;
  return (
    <DenseAccordionSummary
      aria-controls={label}
      id={label}
      disableRipple
    >
      <Grid 
         container
         direction='row'
         alignItems='center'
         alignContent='flex-start'
      >
        <Grid item xs={2}>
          <LayerVisibilityButton id={id}/>
        </Grid>
        <Grid item xs={7}>
          <Typography style={{ marginTop: '1px', marginLeft: '-2px' }}>
            {name}
          </Typography>
        </Grid>
      </Grid>
    </DenseAccordionSummary>
  );
}

export default Header;