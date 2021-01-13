import * as __SNOWPACK_ENV__ from '../_snowpack/env.js';
import.meta.env = __SNOWPACK_ENV__;

import React from "../_snowpack/pkg/react.js";
import ReactDOM from "../_snowpack/pkg/react-dom.js";
import {RecoilRoot} from "../_snowpack/pkg/recoil.js";
import {ThemeProvider} from "../_snowpack/pkg/@material-ui/styles.js";
import Vizarr from "./vizarr.js";
import theme from "./theme.js";
ReactDOM.render(/* @__PURE__ */ React.createElement(ThemeProvider, {
  theme
}, /* @__PURE__ */ React.createElement(RecoilRoot, null, /* @__PURE__ */ React.createElement(Vizarr, null))), document.getElementById("root"));
if (undefined /* [snowpack] import.meta.hot */ ) {
  undefined /* [snowpack] import.meta.hot */ .accept();
}
