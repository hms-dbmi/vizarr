import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'jotai';
import { ThemeProvider } from '@material-ui/styles';

import Vizarr from './vizarr';
import theme from './theme';

import { addCodec } from 'zarr';
addCodec('lz4', () => import('numcodecs/lz4').then(m => m.default));
addCodec('gzip', () => import('numcodecs/gzip').then(m => m.default));
addCodec('zlib', () => import('numcodecs/zlib').then(m => m.default));
addCodec('zstd', () => import('numcodecs/zstd').then(m => m.default));
addCodec('blosc', () => import('numcodecs/blosc').then(m => m.default));

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider>
      <Vizarr />
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);
