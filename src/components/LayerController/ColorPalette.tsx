import { IconButton } from '@material-ui/core';
import { Lens } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { COLORS } from '../../utils';

const useStyles = makeStyles(() => ({
  container: {
    width: '70px',
    height: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '3px',
    width: '16px',
    height: '16px',
  },
}));

const ColorPalette = ({ handleChange }: { handleChange: (c: number[]) => void }) => {
  const classes = useStyles();
  return (
    <div className={classes.container} aria-label="color-swatch">
      {Object.entries(COLORS).map(([name, color]) => {
        return (
          <IconButton className={classes.button} key={name} onClick={() => handleChange(color)}>
            <Lens fontSize="small" style={{ color: `rgb(${color})` }} />
          </IconButton>
        );
      })}
    </div>
  );
};

export default ColorPalette;
