import { createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

export default createMuiTheme({
  palette: {
    type: 'dark',
    primary: grey,
    secondary: grey, 
  },
  props: {
    MuiButton: {
      size: 'small',
    },
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiFilledInput: {
      margin: 'dense',
    },
    MuiFormControl: {
      margin: 'dense',
    },
    MuiFormHelperText: {
      margin: 'dense',
    },
    MuiIconButton: {
      size: 'small',
    },
    MuiInputBase: {
      margin: 'dense',
    },
    MuiInputLabel: {
      margin: 'dense',
    },
    MuiListItem: {
      dense: true,
    },
    MuiOutlinedInput: {
      margin: 'dense',
    },
    MuiFab: {
      size: 'small',
    },
    MuiTable: {
      size: 'small',
    },
    MuiTextField: {
      margin: 'dense',
    },
  },
  overrides: {
    MuiAccordianSummary: {
      root: {
        height: '5px'
      },
    },
    MuiSlider:{
      thumb: {
        '&:focus, &:hover':{
          boxShadow: 'none',
        }
      }
    },
    MuiPaper: {
      root: {
        backgroundColor: 'rgba(50, 50, 50, 0.8)'
      }
    }
  },
});