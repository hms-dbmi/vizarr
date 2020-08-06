const path = require('path');

const debug = process.env.NODE_ENV !== 'production'

module.exports = {
  assetPrefix: !debug ? '/vizarr/' : '',
  webpack: config => {
    config.resolve.alias['@hms-dbmi/viv'] = path.resolve(
      __dirname, './node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js'
    );
    return config;
  },
}; 
