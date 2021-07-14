const pkg = require('./package.json');
const virtual = require('@rollup/plugin-virtual');

const geotiff = `\
export const fromBlob = '';
export const fromUrl = '';
`;

// pkg version avaiable in app via import.meta.env.SNOWPACK_PUBLIC_PACKAGE_VERSION
process.env.SNOWPACK_PUBLIC_PACKAGE_VERSION = pkg.version;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-typescript',
  ],
  packageOptions: {
    rollup: {
      plugins: [ virtual({ geotiff }) ],
    },
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    // change build dir to out/ (next.js compat)
    out: 'out',
    baseUrl: process.env.VIZARR_PREFIX || './',
  },
  alias: {
    /* ... */
  },
};
