import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'jotai';
import { ThemeProvider } from '@material-ui/styles';

import Vizarr from './vizarr';
import theme from './theme';
import './codecs/register';

import { version } from '../package.json';

console.log(`vizarr v${version}: https://github.com/hms-dbmi/vizarr`);

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider>
      <Vizarr />
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);
