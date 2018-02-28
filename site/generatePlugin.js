'use strict';

const packer = require('../src/');
const rezip = require('./rezip');

module.exports = function(contents, privateKey) {
  if (!contents) {
    return Promise.resolve();
  }
  return rezip(Buffer.from(contents))
    .then(contentsZip => packer(contentsZip, privateKey));
};
