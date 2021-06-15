import React from 'react';
import { useAtom } from 'jotai';
import { AccordionSummary, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import LayerVisibilityButton from './LayerVisibilityButton';
import type { AtomPairs } from '../../state';

const DenseAccordionSummary = withStyles({
  root: {
    borderBottom: '1px solid rgba(150, 150, 150, .125)',
    backgroundColor: 'rgba(150, 150, 150, 0.25)',
    display: 'block',
    padding: '0 3px',
    height: 27,
    minHeight: 27,
    overflow: 'hidden',
    transition: 'none',
    '&$expanded': {
      minHeight: 27,
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

function Header({ sourceAtom, layerAtom, name }: AtomPairs & { name: string }): JSX.Element {
  const [sourceData] = useAtom(sourceAtom);
  const label = `layer-controller-${sourceData.id}`;
  return (
    <DenseAccordionSummary aria-controls={label} id={label}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LayerVisibilityButton sourceAtom={sourceAtom} layerAtom={layerAtom} />
        <Typography
          style={{
            marginTop: '4px',
            marginLeft: '5px',
          }}
          variant="body2"
        >
          {name}
        </Typography>
      </div>
    </DenseAccordionSummary>
  );
}

export default Header;
