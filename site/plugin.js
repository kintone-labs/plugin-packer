'use strict';

const packer = require('../src/');
const rezip = require('./rezip');
const {createDownloadUrl, revokeDownloadUrl} = require('./dom');

const generatePluginZip = (contents, privateKey) => {
  if (!contents) {
    return Promise.resolve();
  }
  return rezip(Buffer.from(contents))
    .then(contentsZip => packer(contentsZip, privateKey));
};

// We use generatePlugin to validate plugin zip and ppk
const validatePlugin = generatePluginZip;

const createDownloadUrls = result => ({
  contents: createDownloadUrl(result.plugin, 'application/zip'),
  ppk: createDownloadUrl(result.privateKey, 'text/plain'),
});

const revokePluginUrls = plugin => {
  Object.keys(plugin.url).forEach(key => {
    revokeDownloadUrl(plugin.url[key]);
  });
};

module.exports = {
  generatePluginZip,
  validatePlugin,
  createDownloadUrls,
  revokePluginUrls,
};
