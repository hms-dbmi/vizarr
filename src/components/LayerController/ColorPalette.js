import { IconButton } from '@material-ui/core';
import { Lens } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

export const COLOR_PALLETE = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 255],
  [255, 255, 0],
  [255, 128, 0],
  [0, 255, 255],
  [255, 255, 255],
  [255, 0, 0],
];

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

const ColorPalette = ({ handleChange }) => {
  const classes = useStyles();
  return (
    <div className={classes.container} aria-label="color-swatch">
      {COLOR_PALLETE.map((color) => {
        return (
          <IconButton className={classes.button} key={color} onClick={() => handleChange(color)}>
            <Lens fontSize="small" style={{ color: `rgb(${color})` }} className={classes.icon} />
          </IconButton>
        );
      })}
    </div>
  );
};

export default ColorPalette;
