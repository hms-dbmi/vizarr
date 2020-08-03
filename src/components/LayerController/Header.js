import { AccordionSummary, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import LayerVisibilityButton from './LayerVisibilityButton';

const DenseAccordionSummary = withStyles({
  root: {
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    display: 'block',
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
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LayerVisibilityButton id={id}/>
        <Typography style={{ marginTop: '4px', marginLeft: '3px' }}>
          {name}
        </Typography>
      </div>
    </DenseAccordionSummary>
  );
}

export default Header;