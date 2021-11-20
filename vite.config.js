import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { resolve } from 'path';

const source = process.env.VIZARR_DATA || 'https://s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001253.zarr';

export default defineConfig({
  plugins: [react()],
  base: process.env.VIZARR_PREFIX || './',
  build: {
    outDir: 'out',
    assetsDir: '',
  },
  resolve: {
    alias: {
      zarr: 'zarr/core',
      geotiff: resolve(__dirname, 'src/empty:geotiff.js'),
    },
  },
  server: { open: `?source=${source}` },
});
