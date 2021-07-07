const pkg = require('./package.json');

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
      plugins: [ resolveGeotiff() ],
    },
  },
  buildOptions: {
    // change build dir to out/ (next.js compat)
    out: 'out',
    baseUrl: process.env.VIZARR_PREFIX || './',
  },
  optimize: {
    bundle: true,
    splitting: true,
    minify: true,
    sourcemap: true,
  },
  env: {
    VERSION: pkg.version,
  }
};


/* 
* Custom Rollup Plugin for installing geotiff.js
*
* vizarr doesn't use geotiff component of viv.
* This plugin just creates an empty shim for 
* top-level imports in viv during install by snowpack.
*/

function resolveGeotiff() {
  return {
    name: 'resolve-empty-geotiff',
    async load(id) {
      if (!id.includes('geotiff.js')) return;
      return `
      export const fromBlob = '';
      export const fromUrl = '';
      `;
    },
  }
}
