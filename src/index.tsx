import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@material-ui/styles';

import Vizarr from './vizarr';
import theme from './theme';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <RecoilRoot>
      <Vizarr />
    </RecoilRoot>
  </ThemeProvider>,
  document.getElementById('root')
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
