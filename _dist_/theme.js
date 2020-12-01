import {createMuiTheme} from "../web_modules/@material-ui/core/styles.js";
import grey2 from "../web_modules/@material-ui/core/colors/grey.js";
export default createMuiTheme({
  palette: {
    type: "dark",
    primary: grey2,
    secondary: grey2
  },
  props: {
    MuiButton: {
      size: "small"
    },
    MuiButtonBase: {
      disableRipple: true
    },
    MuiFilledInput: {
      margin: "dense"
    },
    MuiFormControl: {
      margin: "dense"
    },
    MuiFormHelperText: {
      margin: "dense"
    },
    MuiIconButton: {
      size: "small"
    },
    MuiInputBase: {
      margin: "dense"
    },
    MuiInputLabel: {
      margin: "dense"
    },
    MuiOutlinedInput: {
      margin: "dense"
    }
  },
  overrides: {
    MuiSlider: {
      thumb: {
        "&:focus, &:hover": {
          boxShadow: "none"
        },
        height: 11,
        width: 5,
        borderRadius: "15%",
        marginLeft: -1
      }
    },
    MuiInput: {
      underline: {
        "&&&&:hover:before": {
          borderBottom: "1px solid #fff"
        }
      }
    },
    MuiPaper: {
      root: {
        backgroundColor: "rgba(0, 0, 0, 0.8)"
      }
    },
    MuiSvgIcon: {
      root: {
        width: "0.7em",
        height: "0.7em"
      }
    }
  }
});
