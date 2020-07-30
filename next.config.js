const path = require('path');

module.exports = {
  webpack: config => {
    config.resolve.alias['@hms-dbmi/viv'] = path.resolve(
      __dirname, './node_modules/@hubmap/vitessce-image-viewer/dist/bundle.es.js'
    );
    return config;
  },
}; 