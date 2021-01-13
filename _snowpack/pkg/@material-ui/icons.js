import '../common/_commonjsHelpers-37fa8da4.js';
import '../common/typeof-c65245d2.js';
import '../common/defineProperty-1b0b77a2.js';
import '../common/assertThisInitialized-87ceda02.js';
import { _ as _extends } from '../common/deepmerge-9adb393e.js';
import { r as react } from '../common/index-aae33e1a.js';
import '../common/index-c103191b.js';
import '../common/createMuiTheme-0e5622a9.js';
import '../common/withStyles-abfc6f73.js';
import '../common/withStyles-6a9e3764.js';
import { S as SvgIcon } from '../common/SvgIcon-f69034ab.js';

function createSvgIcon(path, displayName) {
  var Component = react.memo(react.forwardRef(function (props, ref) {
    return react.createElement(SvgIcon, _extends({
      ref: ref
    }, props), path);
  }));

  Component.muiName = SvgIcon.muiName;
  return Component;
}

var Add = createSvgIcon(react.createElement("path", {
  d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
}));

var Lens = createSvgIcon(react.createElement("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
}));

var MoreHoriz = createSvgIcon(react.createElement("path", {
  d: "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
}));

var RadioButtonChecked = createSvgIcon(react.createElement("path", {
  d: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
}));

var RadioButtonUnchecked = createSvgIcon(react.createElement("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
}));

var Remove = createSvgIcon(react.createElement("path", {
  d: "M19 13H5v-2h14v2z"
}));

var Visibility = createSvgIcon(react.createElement("path", {
  d: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
}));

var VisibilityOff = createSvgIcon(react.createElement("path", {
  d: "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
}));

export { Add, Lens, MoreHoriz, RadioButtonChecked, RadioButtonUnchecked, Remove, Visibility, VisibilityOff };
