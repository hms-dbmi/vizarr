import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { resolve } from 'path';

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
});
