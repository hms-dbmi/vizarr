import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

import { resolve } from 'path';

export default defineConfig({
  plugins: [reactRefresh()],
  base: process.env.VIZARR_PREFIX || './',
  build: {
    outDir: 'out',
  },
  resolve: {
    alias: {
      zarr: 'zarr/core',
      geotiff: resolve(__dirname, 'src/empty:geotiff.js'),
    },
  },
});
