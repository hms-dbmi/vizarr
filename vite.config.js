import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import virtual from 'esbuild-plugin-virtual';

/*
 * This virtual module provides an "empty" export of geotiff's
 * top-level API. This avoids trying to resolve any of geotiff's
 * inner, difficult to resolve exports.
 */
const geotiff = `\
export const fromUrl = '';
export const fromBlob = '';
`;

export default defineConfig({
  plugins: [reactRefresh()],
  base: process.env.VIZARR_PREFIX || './',
  build: {
    outDir: 'out',
  },
  resolve: {
    alias: {
      zarr: 'zarr/core',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [virtual({ geotiff })],
    },
  },
});
