import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

import { resolve } from 'path';

export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    outDir: 'out',
    publicPath: process.env.VIZARR_PREFIX || './',
  },
  resolve: {
    alias: {
      zarr: 'zarr/core',
      geotiff: resolve(__dirname, 'src/empty:geotiff.js'),
    },
  },
});
