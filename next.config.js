const path = require('path');

module.exports = {
  assetPrefix:  process.env.GITHUB_JOB === 'build-and-deploy' ? '/vizarr/' : '',
  webpack: config => {
    config.resolve.alias['viv'] = path.resolve(
      __dirname, './node_modules/@hms-dbmi/viv/dist/bundle.es.js'
    );
    return config;
  },
}; 
