const path = require('path');
const pkg = require('./package.json');

function getAssetPrefix() {
  if (process.env.VIZARR_PREFIX) return process.env.VIZARR_PREFIX;
  if (process.env.GITHUB_JOB === 'build-and-deploy') return '/vizarr/';
  if (process.env.NPM_BUILD) return `/${pkg.name}@${pkg.version}/`;
  return '';
}

module.exports = {
  assetPrefix:  getAssetPrefix(),
  webpack: config => {
    config.resolve.alias['viv'] = path.resolve(
      __dirname, './node_modules/@hms-dbmi/viv/dist/bundle.es.js'
    );
    return config;
  },
}; 
