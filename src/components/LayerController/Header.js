import { AccordionSummary, Grid, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';
import LayerVisibilityButton from './LayerVisibilityButton';

const DenseAccordionSummary = withStyles({
  root: {
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    padding: '0 3px',
    height: 30,
    minHeight: 30,
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
      <Grid container direction='row' alignItems='center'>
        <LayerVisibilityButton id={id}/>
        <Typography style={{ marginTop: '3px', marginLeft: '3px' }}>{name}</Typography>
      </Grid>
    </DenseAccordionSummary>
  );
}

export default Header;