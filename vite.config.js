import * as path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const source = process.env.VIZARR_DATA || 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001253.zarr';

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
      '@hms-dbmi/vizarr': path.resolve(__dirname, 'src/index.tsx'),
    },
  },
  server: {
    open: `?source=${source}`,
  },
});
