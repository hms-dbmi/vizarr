// @ts-check
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import { resolve } from 'path';

const manifest = {
  name: 'vizarr',
  short_name: 'vizarr',
  lang: 'en-US',
  start_url: '.',
  display: 'standalone',
  theme_color: '#000000',
  icons: [
    {
      src: 'logo-512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'logo-256.png',
      sizes: '256x256',
      type: 'image/png',
    },
    {
      src: 'logo-192.png',
      sizes: '192x192',
      type: 'image/png',
    },
  ],
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt'],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,json,ico,png,html,txt}'],
      },
    }),
  ],
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
