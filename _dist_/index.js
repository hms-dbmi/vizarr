import __SNOWPACK_ENV__ from '../__snowpack__/env.js';
import.meta.env = __SNOWPACK_ENV__;

import React from "../web_modules/react.js";
import ReactDOM from "../web_modules/react-dom.js";
import {RecoilRoot} from "../web_modules/recoil.js";
import {ThemeProvider} from "../web_modules/@material-ui/styles.js";
import Vizarr from "./vizarr.js";
import theme2 from "./theme.js";
ReactDOM.render(/* @__PURE__ */ React.createElement(ThemeProvider, {
  theme: theme2
}, /* @__PURE__ */ React.createElement(RecoilRoot, null, /* @__PURE__ */ React.createElement(Vizarr, null))), document.getElementById("root"));
if (import.meta.hot) {
  import.meta.hot.accept();
}
