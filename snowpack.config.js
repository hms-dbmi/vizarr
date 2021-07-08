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
  alias: {
    'geotiff': './src/geotiff-resolve:empty.js',
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
